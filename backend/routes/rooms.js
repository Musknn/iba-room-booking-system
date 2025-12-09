// routes/rooms.js - Updated with debugging
const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../config/database');

// GET all rooms
router.get('/', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `BEGIN ViewAllRooms(:cursor); END;`,
      { cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );
    
    const rs = result.outBinds.cursor;
    const rows = await rs.getRows();
    await rs.close();
    
    // DEBUG: Log what we're getting
    console.log('ViewAllRooms - Raw rows:', rows);
    console.log('Number of rows:', rows.length);
    if (rows.length > 0) {
      console.log('First row structure:', rows[0]);
      console.log('First row as array:', Array.isArray(rows[0]));
      console.log('First row length:', rows[0].length);
    }
    
    // Try different mapping approaches
    const rooms = rows.map(r => {
      // Oracle returns rows as arrays by default
      if (Array.isArray(r)) {
        return {
          room_id: r[0],
          room_name: r[1] || "Unnamed Room",
          room_type: r[2],
          building_id: r[3],
          building_name: r[4] || "Unknown Building"
        };
      } 
      // Or as objects if configured differently
      else if (r && typeof r === 'object') {
        return {
          room_id: r.ROOM_ID || r.room_id,
          room_name: r.ROOM_NAME || r.room_name || "Unnamed Room",
          room_type: r.ROOM_TYPE || r.room_type,
          building_id: r.BUILDING_ID || r.building_id,
          building_name: r.BUILDING_NAME || r.building_name || "Unknown Building"
        };
      }
      return null;
    }).filter(Boolean);
    
    console.log('Processed rooms:', rooms);
    
    res.json({ success: true, data: rooms });
  } catch (err) {
    console.error('Error in GET /:', err);
    res.status(500).json({ success: false, data: [], error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// GET rooms by building NAME
router.get('/building/:name', async (req, res) => {
  const buildingName = decodeURIComponent(req.params.name);
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `BEGIN GetRoomsByBuilding(:name, :cursor); END;`,
      { 
        name: buildingName, 
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } 
      }
    );
    
    const rs = result.outBinds.cursor;
    const rows = await rs.getRows();
    await rs.close();
    
    console.log(`GetRoomsByBuilding('${buildingName}') - Raw rows:`, rows);
    
    const rooms = rows.map(r => {
      if (Array.isArray(r)) {
        return {
          room_id: r[0],
          room_name: r[1] || "Unnamed Room",
          room_type: r[2],
          building_id: r[3],
          building_name: r[4] || buildingName
        };
      } else if (r && typeof r === 'object') {
        return {
          room_id: r.ROOM_ID || r.room_id,
          room_name: r.ROOM_NAME || r.room_name || "Unnamed Room",
          room_type: r.ROOM_TYPE || r.room_type,
          building_id: r.BUILDING_ID || r.building_id,
          building_name: r.BUILDING_NAME || r.building_name || buildingName
        };
      }
      return null;
    }).filter(Boolean);
    
    res.json({ success: true, data: rooms });
  } catch (err) {
    console.error(`Error in GET /building/${buildingName}:`, err);
    res.status(500).json({ success: false, data: [], error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// SEARCH rooms by name
router.get('/search', async (req, res) => {
  const query = req.query.query || '';
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `BEGIN SearchRoomsByName(:query, :cursor); END;`,
      { 
        query: query.trim(),
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } 
      }
    );
    
    const rs = result.outBinds.cursor;
    const rows = await rs.getRows();
    await rs.close();
    
    console.log(`SearchRoomsByName('${query}') - Raw rows:`, rows);
    
    const rooms = rows.map(r => {
      if (Array.isArray(r)) {
        return {
          room_id: r[0],
          room_name: r[1] || "Unnamed Room",
          room_type: r[2],
          building_id: r[3],
          building_name: r[4] || "Unknown Building"
        };
      } else if (r && typeof r === 'object') {
        return {
          room_id: r.ROOM_ID || r.room_id,
          room_name: r.ROOM_NAME || r.room_name || "Unnamed Room",
          room_type: r.ROOM_TYPE || r.room_type,
          building_id: r.BUILDING_ID || r.building_id,
          building_name: r.BUILDING_NAME || r.building_name || "Unknown Building"
        };
      }
      return null;
    }).filter(Boolean);
    
    res.json({ success: true, data: rooms });
  } catch (err) {
    console.error('Error in GET /search:', err);
    res.status(500).json({ success: false, data: [], error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;