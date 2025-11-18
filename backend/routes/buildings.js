const express = require('express');
const oracledb = require('oracledb');  // ← ADD THIS LINE AT THE TOP
const { getConnection } = require('../config/database');
const router = express.Router();

// Get all buildings for dropdown
router.get('/', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(`
      SELECT building_id, building_name 
      FROM Building 
      ORDER BY building_name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching buildings:', error);
    res.status(500).json({ error: 'Failed to fetch buildings' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

// Add new building - FIXED VERSION
router.post('/add', async (req, res) => {
  let connection;
  try {
    const { name, inchargeERP, inchargeName, inchargeEmail } = req.body;
    console.log('Adding building:', { name, inchargeERP, inchargeName, inchargeEmail });
    
    connection = await getConnection();
    
    const result = await connection.execute(
      `BEGIN 
        add_building(:name, :erp, :inchargeName, :email, :result); 
       END;`,
      {
        name: name,
        erp: inchargeERP,
        inchargeName: inchargeName,
        email: inchargeEmail,
        result: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 }
      }
    );
    
    console.log('Procedure result:', result.outBinds.result);
    res.json({ message: result.outBinds.result });
    
  } catch (error) {
    console.error('Error adding building:', error);
    res.status(500).json({ error: 'Failed to add building: ' + error.message });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

// Add room to building - FIXED VERSION
router.post('/rooms/add', async (req, res) => {
  let connection;
  try {
    const { buildingName, roomName, roomType } = req.body;
    console.log('Adding room:', { buildingName, roomName, roomType });
    
    connection = await getConnection();
    
    const result = await connection.execute(
      `BEGIN 
        add_room(:buildingName, :roomName, :roomType, :result); 
       END;`,
      {
        buildingName: buildingName,
        roomName: roomName,
        roomType: roomType,
        result: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 }
      }
    );
    
    console.log('Procedure result:', result.outBinds.result);
    res.json({ message: result.outBinds.result });
    
  } catch (error) {
    console.error('Error adding room:', error);
    res.status(500).json({ error: 'Failed to add room: ' + error.message });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

module.exports = router;