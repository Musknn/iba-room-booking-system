const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const dbConfig = {
  user: 'c##room',
  password: 'Room123',  // ← Use the correct password
  connectString: 'localhost:1521/XE'  // ← Use port 1521, not 1512
};

async function getConnection() {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    console.log('✅ Connected to Oracle Database');
    return connection;
  } catch (err) {
    console.error('❌ Database connection error:', err);
    throw err;
  }
}

module.exports = { getConnection };