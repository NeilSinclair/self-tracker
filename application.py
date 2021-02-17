from flask import Flask, render_template, request, json, jsonify
from datetime import datetime as dt
import numpy as np
import pandas as pd
import sqlalchemy
from sklearn.linear_model import LinearRegression
from sklearn import preprocessing
import datetime

app = Flask(__name__)
# Stop the sorting of dict keys when they're passed to the frontend
app.config['JSON_SORT_KEYS'] = False


LOCAL_ = False # i.e. set to false for AWS-ready version
if LOCAL_:
    #Config items for localHost
    db = None
else:
    #Config items for localHost
    db = None

# Database columns list and placeholder number of %s for database insertion
# Note: It's important to keep these in the same order they're stored on the database
DB_COLS = ["user_id", "energy_levels", "well_being", "frustration",  "anxiety_level", "hours_sleep", "cups_coffee",
"units_alcohol", "minutes_exercise", "hours_work", "day_highlight", "day_lowlight", "free_text",
"date", "hour"]
PLACEHOLDER = "("+', '.join(["%s"] * len(DB_COLS)) + ")"

@app.route("/")
def home():
    return render_template("dailyupdate.html")

@app.route("/capturedaily", methods = ["POST"])
def capturedaily():
    # Try to grab the data from the daily form
    try:    
        # Store the time 
        now = dt.now()
        hour = now.strftime("%H")
        date = now.strftime("%Y-%m-%d")
        # Create a list to be transferred to tuple for adding data to the database
        insert_list = []
        # insert_list.append("NEI001")

        # These values must be numeric otherwise the DB won't load them
        numeric_vals = ['hours_sleep', 'cups_coffee', 'units_alcohol','exercise', 'hours_work', 'anxiety_level']

        #Cycle through each of the elements that come through from the form
        for key, val in request.form.items():
            if len(val) == 0 and key in numeric_vals:
                val = 0
            elif len(val) == 0:
                val = ""
            insert_list.append(val)
       
        insert_list.extend([date, hour])
        insert_list = tuple(insert_list)

        # Open the database and load the tuple
        with db.connect() as cursor:
            query = "INSERT INTO daily_entries (" + ', '.join(DB_COLS) + ") VALUES " + PLACEHOLDER
            cursor.execute(query,insert_list)

        return jsonify("Values loaded: {}".format(insert_list))   
    
    except Exception as e:
        return jsonify("Error capturing the data: " + str(e))

@app.route("/home")
def about():
    return render_template("index.html")

@app.route("/getuserdata", methods = ["GET", "POST"])
def getuserdata(caller = 'frontend'):
    # Function to pull user data from the database
    # Parameter:    caller - indicates if it was called from frontend or backend
    # Pull all the user data from the database and send it to the frontend
    # The data is just text, so it won't take up much space
    try:
        # The username is sent to the server
        user_id = request.get_json()
        user_id = "NEI001"
        # user_id = "TEST"
        entry = []
        if len(user_id) > 0:
            if db is None:
                ud = pd.read_csv('emoticondb_2805.csv')
                for col in ud.select_dtypes(include='int64').columns:
                    ud[col] = ud[col].astype(float)
                for i in range(len(ud)):
                    row = (ud.iloc[i,:].fillna('').to_dict())
                    row['date'] = datetime.datetime.strptime(row['date'], "%Y/%m/%d").date()
                    entry.append(row)

            else:
                with db.connect() as cursor:
                    user_data = cursor.execute("SELECT * FROM daily_entries WHERE user_id = (%s)", (user_id,)).fetchall()
                    # Load the data into a list with [{col_name_1: data, ...., col_name_n: data}]   
                    for item in user_data:
                        entry.append({DB_COLS[col]:data for col, data in enumerate(item)})

                #  If the function is called from the backend, run the models too
            if caller == 'backend':
                runModel(entry)

            return jsonify([i for i in entry])
        
        else:
            return(jsonify("No user name was given"))
    
    except Exception as e:
        return json.dumps({'error':str(e)})

@app.route("/drivers")
def loadDrivers():
    return render_template("drivers.html")

@app.route('/runmodel')
def runModel(db_input):
    # Function recieves the data from the database when the user loads the website
    # Parameters:   db_input - a list of [{...,...}] dict objects containing the user info
    # Runs a linear regression model

    # Turn the data into a dataframe
    user_df = pd.DataFrame(db_input)
    
    # Anxiety is left out here because of the NaNs; add back in when I 've got more data
    predictors = ['cups_coffee','hours_sleep', 'hours_work', 'minutes_exercise', 'units_alcohol']
    
    lm_wellbeing = LinearRegression()
    lm_energy = LinearRegression()
    lm_frustration = LinearRegression()


    lm_wellbeing.fit(preprocessing.scale(user_df[predictors]), preprocessing.scale(user_df["well_being"]))
    lm_energy.fit(preprocessing.scale(user_df[predictors]), preprocessing.scale(user_df["energy_levels"]))
    lm_frustration.fit(preprocessing.scale(user_df[predictors]), preprocessing.scale(user_df["frustration"]))

    # Extract information from model by assessing the variables with the most positive and most negative
    # coefficients

    well_being_df = pd.DataFrame(data = {"predictors":predictors, "coefficients":lm_wellbeing.coef_}).sort_values(by = "coefficients")
    energy_df = pd.DataFrame(data = {"predictors":predictors, "coefficients":lm_energy.coef_}).sort_values(by = "coefficients")
    frustration_df = pd.DataFrame(data = {"predictors":predictors, "coefficients":lm_frustration.coef_}).sort_values(by = "coefficients")
    
    return 0

if __name__ == "__main__":
    app.run(debug = True)
