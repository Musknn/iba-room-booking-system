const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

//Enter the username, password, and port + service you are using
//Make sure you run the DDL script on your device before running this.
const dbConfig = {
  user: 'c##room',  
  password: 'Room123',  
  connectString: 'localhost:1521/XE'  
};

//This code block tries to connect your Node.js application to Oracle database using oracledb
async function getConnection() {
  try {
    const connection = await oracledb.getConnection(dbConfig); //await is used to wait till the connection is formed or not.
    console.log('Connected to Oracle Database');
    return connection;
  } catch (err) {
    console.error('Database connection error:', err);
    throw err;
  }
}

module.exports = { getConnection };