// routes/buildings.js
const express = require('express');
const oracledb = require('oracledb');
const { getConnection } = require('../config/database');
const router = express.Router();


// ===============================
// GET ALL BUILDINGS
// ===============================
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
    if (connection) await connection.close();
  }
});


// ===============================
// ADD BUILDING (MATCHING FRONTEND EXACTLY)
// ===============================
router.post('/add', async (req, res) => {
  let connection;
  try {
    // 🔥 FRONTEND sends THESE keys (we must use them exactly)
    const {
      building_name,
      incharge_erp,
      incharge_name,
      incharge_email,
      phone_number
    } = req.body;

    console.log("🟢 ADD BUILDING PAYLOAD:", req.body);

    // VALIDATION (Optional)
    if (!building_name || !incharge_erp || !incharge_name) {
      return res.status(400).json({
        status: "FAILED",
        message: "Missing required fields"
      });
    }

    connection = await getConnection();

    // CALL ORACLE PROCEDURE
    const result = await connection.execute(
      `BEGIN 
          add_building(
              :p_building_name,
              :p_incharge_erp,
              :p_incharge_name,
              :p_incharge_email,
              :p_phone,
              :p_result
          ); 
       END;`,
      {
        p_building_name: building_name,
        p_incharge_erp: incharge_erp,
        p_incharge_name: incharge_name,
        p_incharge_email: incharge_email,
        p_phone: phone_number,
        p_result: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 }
      }
    );

    console.log("🟢 PROCEDURE OUTPUT:", result.outBinds.p_result);

    res.json({
      status: "OK",
      message: result.outBinds.p_result
    });

  } catch (error) {
    console.error('❌ Error adding building:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.close();
  }
});


// ===============================
// ADD ROOM
// ===============================
router.post('/rooms/add', async (req, res) => {
  let connection;
  try {
    const { buildingName, roomName, roomType } = req.body;

    console.log("🟢 ADD ROOM PAYLOAD:", req.body);

    connection = await getConnection();

    const result = await connection.execute(
      `BEGIN 
          add_room(
              :p_building_name,
              :p_room_name,
              :p_room_type,
              :p_result
          ); 
       END;`,
      {
        p_building_name: buildingName,
        p_room_name: roomName,
        p_room_type: roomType,
        p_result: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 }
      }
    );

    res.json({
      status: "OK",
      message: result.outBinds.p_result
    });

  } catch (error) {
    console.error('❌ Error adding room:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.close();
  }
});


module.exports = router;
