// routes/buildings.js
const express = require('express');
const oracledb = require('oracledb');
const { getConnection } = require('../config/database');
const router = express.Router();

//GET API endpoint -> used to get buildings
// "/" -> url
router.get('/', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();

    //runs a query to find all the buildings from the building table and order them by the building name.
    //probably could be made a procedure
    const result = await connection.execute(`
      SELECT building_id, building_name 
      FROM Building 
      ORDER BY building_name
    `);

    res.json(result.rows); //result.rows = rows of the buildings
    //res.json - > sends this response to the frontend

  } catch (error) {
    console.error('Error fetching buildings:', error);
    res.status(500).json({ error: 'Failed to fetch buildings' });
  } finally {
    if (connection) await connection.close();
  }
});


//Add building -> Can be donw by PO only.
//POST API endpoint
router.post('/add', async (req, res) => {
  let connection;
  try {
    //extract the information from the request that we are going to use
    const {
      building_name,
      incharge_erp,
      incharge_name,
      incharge_email,
      phone_number
    } = req.body;

    console.log("ADD BUILDING PAYLOAD:", req.body);

    //Checking if any of the fields is missing -> throw error
    if (!building_name || !incharge_erp || !incharge_name) {
      return res.status(400).json({
        status: "FAILED",
        message: "Missing required fields"
      });
    }

    connection = await getConnection();

    // In an anonymous PL/SQL block, we are calling the stored PL/SQL from the database "add_building"
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
        //INPUT
        p_building_name: building_name,
        p_incharge_erp: incharge_erp,
        p_incharge_name: incharge_name,
        p_incharge_email: incharge_email,
        p_phone: phone_number,
        //OUTPUT
        p_result: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 }
      }
    );

    console.log("PROCEDURE OUTPUT:", result.outBinds.p_result);

    res.json({
      status: "OK",
      message: result.outBinds.p_result
    });

  } catch (error) {
    console.error('Error adding building:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.close();
  }
});


//Add Room -> Can be done by Program Office only.
//url "/rooms/add" 
//POST API endpoint
router.post('/rooms/add', async (req, res) => {
  let connection;
  try {
    //extract the info we want to use from the request
    const { buildingName, roomName, roomType } = req.body;

    console.log("ADD ROOM PAYLOAD:", req.body);

    connection = await getConnection();

    const result = await connection.execute(
      //in an anonymous block -> we call the "add_room" procedure from out database
      `BEGIN 
          add_room(
              :p_building_name,
              :p_room_name,
              :p_room_type,
              :p_result
          ); 
       END;`,
      {
        //INPUT:
        p_building_name: buildingName,
        p_room_name: roomName,
        p_room_type: roomType,
        //OUTPUT:
        p_result: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 }
      }
    );

    res.json({
      status: "OK",
      message: result.outBinds.p_result
    });

  } catch (error) {
    console.error('Error adding room:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.close();
  }
});


module.exports = router;
