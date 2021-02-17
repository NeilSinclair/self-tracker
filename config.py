# edit the URI below to add your RDS password and your AWS URL
# The other elements are the same as used in the tutorial
# format: (user):(password)@(db_identifier).amazonaws.com:3306/(db_name)

db_user = "NeilSinclair"
db_pass = "Passw0rd!"
db_name = "capturedaily"
db_host = "capturedaily.cij28owg7h6d.us-east-1.rds.amazonaws.com"
SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://{}:{}@{}/{}'.format(db_user, db_pass, db_host, db_name)

SQLALCHEMY_POOL_RECYCLE = 3600

WTF_CSRF_ENABLED = True
SECRET_KEY = 'GLUMzVx3Uj17EougEZZTnZJNotDUv/hhvnCuLGvj'