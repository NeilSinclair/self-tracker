// Some preliminary global variables
var chartType = "line";
var lastButtonPressed = "Energy Levels";
// var for the graph
var xLab = "Date";
var yLab = "Well Being";

// Start by loading the user data
var user_id = "NEI001"; // this is just temporary, should be updated later
var userData = [];
// Load the user's data as the page loads; there should be a better way to do this
window.onload = async function (){
    // This call updates a global variable, so the below code just runs this
    const accessingTheDb = await getUserData(user_id);
    //console.log(userData[7]);
    this.updateChart("line","well_being");
};

var buttonListRef = {"Wellbeing": "well_being", "Units alcohol":"units_alcohol",
                    "Exercise":"minutes_exercise", "Hours Work":"hours_work",
                    "Energy Levels":"energy_levels", "Cups of Coffee":"cups_coffee",
                    "Frustration":"frustration", "Anxiety":"anxiety_level",
                    "Hours Sleep":"hours_sleep"};

console.log("This is the user data " + userData);

// Generate the buttons needed to select the info on the chart
var buttons_list = ["Wellbeing", "Anxiety", "Frustration", "Energy Levels",
                    "Units alcohol", "Cups of Coffee", "Hours Work", "Exercise", "Hours Sleep"];
var button = [];
for (item in buttons_list){
    button[item] = document.createElement("button");
    button[item].innerHTML = buttons_list[item];
    button[item].className= "btn btn-sm btn-primary";
    button[item].style.marginRight = "10px";
    button[item].style.marginLeft = "10px";
    button[item].style.marginBottom = "5px";
    // Attach this function when the button is pressed
    button[item].addEventListener("click", processButton);
    var body = document.getElementById("buttons_div");
    body.appendChild(button[item])
}

function processButton(e){
    // when one of the data choice buttons is pressed, check whether the user is viewing by line or by scatter plot
    // based on this, unselect an appropriate button; after this, pull data from the DB to display
    let ele = e.target;
    // Find and pass the name of the button pressed to the database to retrieve the data
    let newDataRequest = ele.innerHTML;
    if (chartType == "line"){
        // see which button was pressed and pass it to the update function
        let yVarName = buttonListRef[newDataRequest];
        updateChart("line",yVarName);
    } else {
        // pull the requested userData; if it's the first time pressing the button, update 2nd axis, otherwise
        // update the first axis
        let yVarName = buttonListRef[newDataRequest];
        let xVarName = buttonListRef[lastButtonPressed];
        updateChart("scatter", yVarName, xVarName);
    }
    
    // update the last button pressed after the chart has been updated
    lastButtonPressed = newDataRequest;
    // console.log("Element is ", ele.innerHTML);
}

// Upadate the chart
function updateChart(chartType_, yVarName, xVarName = "date"){
    // Parameters:  chartType_ is a string, either "line" or "scatter"
    //              yVarName is the name of a column from the database
    //              xVarName is the name of the other variable if scatter is chosen
    let yVals = [];
    let xVals = [];
    // update the axes Names
    xLab = xVarName;
    yLab = yVarName;
    var axisSettings = {legend: {display:false},
            scales:{
                yAxes:[{
                    ticks:{
                        beginAtZero:true}, 
                        scaleLabel: {display: true, labelString: yLab}}],
                xAxes:[{
                    scaleLabel: {display: true, labelString: xLab},
                    ticks: {
                        beginAtZero: false}}]}};
    // Run two different loops for either the line or scatterplots
    if (chartType_ === "line"){
        for(var i = 0; i < userData.length; i++){
            yVals.push(userData[i][yVarName]);
            let tempDate = new Date(userData[i]["date"])
            xVals.push(tempDate.getDate());
        }
        myData["datasets"][0]["data"] = yVals;
        myData["labels"] = xVals;
        myData["datasets"][0]["label"] = "";
    } else {
        var scatterData = [];
        for(var i = 0; i < userData.length; i++){
            yVals.push(userData[i][yVarName]);
            xVals.push(userData[i][xVarName]);
            scatterData.push({x : xVals[i], y: yVals[i]});
        }
        myData["datasets"][0]["data"] = scatterData;
        console.log(scatterData);
    }
    
    // regenerate the chart with the new values
    chart.destroy();
    chart = new Chart(ctx, {
        type: chartType_,
        data: myData,
        options: axisSettings
    });
    // console.log(labelName);
}

// Section for generating the chart

// Stand-in data for the chart
let myData = {
    labels : [],
    datasets: [{
        label: '',
        backgroundColor: 'rgb(255,153,0)',
        borderColor: 'rgb(0,0,0)',
        data: []
    }]
};
// Locate the chart and instantiate it
let ctx = document.getElementById('summaryChart').getContext('2d');
 
let chart = new Chart(ctx, {
    type: "line",
    data: myData
});

// Code for changing the chart type when the "time" button is select
document.getElementById("chart_time").onclick = function(){
    chartType = "line";
    updateChart("line", buttonListRef[lastButtonPressed]);
};

// Code for changing the chart into a scatter plot when the "relationship" button is pressed
document.getElementById("chart_rel").onclick = function(){
    chartType = "scatter";
    // When the graph moves to scatter, another data point needs to be added; automatically add "well_being"
    updateChart("scatter", buttonListRef[lastButtonPressed], "well_being");
};

// Ajax call to the DB to get user 
function getUserData(user_id){
    // Take a string "newDataRequest" which indicates what the server must pull from the 
    
    let promise = new Promise(function(resolve, reject){
        $.post({
            url: '/getuserdata',
            type: 'POST',
            data: JSON.stringify(user_id),
            contentType: 'application/json',
            dataType: 'json',
            success: function(data){
                userData = data;
                console.log("Successfully recieved user data");
//                 console.log(JSON.stringify(data));
                resolve("Resolve: data successfully received");
            },
            error: function(error){
                console.log("Error loading user data");
                reject("Couldn't load the user data");
            }
        });

    });
    return promise;
}