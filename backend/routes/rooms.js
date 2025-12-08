//necessary imports
const express = require('express');
const oracledb = require('oracledb');
const { getConnection } = require('../config/database');
const router = express.Router();


//there are alot of issues with this backend file
//it doesnt look like it is using any procedure from the database

//WE SHOULD REMOVE THIS AS WE NEED TO SHOW OUT DATABASE IS WORKING FINE AND this is dummy data which is not needed
//all dummy, debugging, and fallback should be entirely removed for db project as it means we are cheating or lying
//---------------------------------------------------------------------------------------------------------------------
// ============================================
// SIMPLE TEST ENDPOINT (without database)
// ============================================
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Rooms API is working',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// DUMMY DATA ENDPOINT (for testing without DB)
// ============================================
router.get('/dummy', (req, res) => {
  console.log('📡 GET /api/rooms/dummy called');
  
  const dummyRooms = [
    { room_id: 1, room_name: 'MAC-1', room_type: 'CLASSROOM', building_id: 1, building_name: 'Adamjee' },
    { room_id: 2, room_name: 'MAC-2', room_type: 'CLASSROOM', building_id: 1, building_name: 'Adamjee' },
    { room_id: 3, room_name: 'BREAKOUT-1', room_type: 'BREAKOUT', building_id: 1, building_name: 'Adamjee' },
    { room_id: 4, room_name: 'AUDITORIUM', room_type: 'CLASSROOM', building_id: 1, building_name: 'Adamjee' },
    { room_id: 5, room_name: 'MCC-9', room_type: 'CLASSROOM', building_id: 2, building_name: 'Aman CED' },
    { room_id: 6, room_name: 'MC-BREAKOUT-1', room_type: 'BREAKOUT', building_id: 2, building_name: 'Aman CED' },
    { room_id: 7, room_name: 'MTC-16', room_type: 'CLASSROOM', building_id: 3, building_name: 'Tabba' },
    { room_id: 8, room_name: 'MT-BREAKOUT-1', room_type: 'BREAKOUT', building_id: 3, building_name: 'Tabba' },
    { room_id: 9, room_name: 'EC-CONF-1', room_type: 'CLASSROOM', building_id: 4, building_name: 'Executive Center' },
    { room_id: 10, room_name: 'GYM', room_type: 'CLASSROOM', building_id: 5, building_name: 'Sports Complex' }
  ];
  
  const dummyBuildings = [
    { building_id: 1, building_name: 'Adamjee' },
    { building_id: 2, building_name: 'Aman CED' },
    { building_id: 3, building_name: 'Tabba' },
    { building_id: 4, building_name: 'Executive Center' },
    { building_id: 5, building_name: 'Sports Complex' }
  ];
  
  res.json({
    success: true,
    data: dummyRooms,
    buildings: dummyBuildings,
    count: dummyRooms.length,
    message: 'Dummy data loaded successfully'
  });
});
//---------------------------------------------------------------------------------------------------------------------


//View all rooms
//GET API endpoint

router.get('/', async (req, res) => {
  let connection;
  try {
    
    // Try to get database connection
    try {
      connection = await getConnection();
      console.log('Database connection established');
    } catch (dbError) {
      console.log('Database connection failed, using dummy data');
      //---------------------------------------------------------------------------------------
      //remove this too
      // Fallback to dummy data
      const dummyRooms = [
        { room_id: 1, room_name: 'MAC-1', room_type: 'CLASSROOM', building_id: 1, building_name: 'Adamjee' },
        { room_id: 2, room_name: 'MAC-2', room_type: 'CLASSROOM', building_id: 1, building_name: 'Adamjee' },
        { room_id: 3, room_name: 'BREAKOUT-1', room_type: 'BREAKOUT', building_id: 1, building_name: 'Adamjee' }
      ];      
      return res.json({
        success: true,
        data: dummyRooms,
        count: dummyRooms.length,
        message: 'Using demo data (database not available)',
        demo: true
      });
      //---------------------------------------------------------------------------------------------------

    }
    
    //----------------------------------------------------------------------------------------------------------
    //this debug query should be removed too
    // DEBUG: First try a simple SQL query to see what's in the table
    console.log('🔍 Testing simple SQL query...');
    const testResult = await connection.execute(
      `SELECT room_id, room_name, room_type, building_id FROM Room WHERE ROWNUM <= 5`
    );
    
    console.log('🔍 Test query result:', {
      rows: testResult.rows,
      metadata: testResult.metaData
    });
    //-----------------------------------------------------------------------------------------
    
    const result = await connection.execute(
      //In the anonymous block -> we call the stored procedure from the database "ViewAllRooms"
      `BEGIN
         ViewAllRooms(:cursor);
       END;`,
      {
        cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
      }
    );

    const cursor = result.outBinds.cursor;
    
    if (!cursor) {
      console.error('Cursor is null!');
      throw new Error('Database cursor is null');
    }
    
    //very complicated -> needs to be refined.
    // Try different ways to get rows
    let rows = [];
    try {
      // Method 1: Try getRows()
      rows = await cursor.getRows();
      console.log(`✅ Got ${rows.length} rows using getRows()`);
    } catch (getRowsError) {
      console.log('⚠️ getRows() failed, trying fetch...');
      
      // Method 2: Try fetch manually
      try {
        let row;
        while ((row = await cursor.getRow())) {
          rows.push(row);
        }
        console.log(`✅ Got ${rows.length} rows using getRow()`);
      } catch (fetchError) {
        console.error('❌ Both getRows and getRow failed:', fetchError);
        throw new Error('Failed to fetch rows from cursor');
      }
    }
    
    await cursor.close();
    
    console.log(`✅ Found ${rows.length} rows from database`);
    console.log('🔍 First row sample:', rows[0]);
    console.log('🔍 Row type:', typeof rows[0]);
    console.log('🔍 Is array?', Array.isArray(rows[0]));
    
    // Transform to proper format - handle both array and object formats
    let rooms = [];
    
    if (rows.length > 0) {
      // Check if rows are arrays (Oracle cursor returns arrays)
      if (Array.isArray(rows[0])) {
        console.log('📊 Rows are arrays, mapping by index...');
        rooms = rows.map((rowArray, index) => {
          // Oracle returns: [room_id, room_name, room_type, building_id, building_name]
          return {
            room_id: rowArray[0] || index + 1,
            room_name: rowArray[1] || `Room ${index + 1}`,
            room_type: rowArray[2] || 'UNKNOWN',
            building_id: rowArray[3] || 0,
            building_name: rowArray[4] || 'Unknown Building'
          };
        });
      } 
      // Check if rows are objects
      else if (typeof rows[0] === 'object' && rows[0] !== null) {
        console.log('📊 Rows are objects, checking keys...');
        console.log('🔍 First object keys:', Object.keys(rows[0]));
        
        // Try to extract data from object
        rooms = rows.map((rowObj, index) => {
          // Try UPPERCASE keys first (Oracle default)
          let room = {
            room_id: rowObj.ROOM_ID || rowObj.room_id || rowObj.ID || rowObj.id || index + 1,
            room_name: rowObj.ROOM_NAME || rowObj.room_name || rowObj.NAME || rowObj.name || `Room ${index + 1}`,
            room_type: rowObj.ROOM_TYPE || rowObj.room_type || rowObj.TYPE || rowObj.type || 'UNKNOWN',
            building_id: rowObj.BUILDING_ID || rowObj.building_id || rowObj.BLDG_ID || 0,
            building_name: rowObj.BUILDING_NAME || rowObj.building_name || rowObj.BLDG_NAME || 'Unknown Building'
          };
          
          // If still empty, log the object for debugging
          if (!room.room_name || room.room_name.includes('Room ')) {
            console.log(`⚠️ Row ${index} has empty name, object:`, rowObj);
          }
          
          return room;
        });
      }
      // Unknown format
      else {
        console.error('❌ Unknown row format:', typeof rows[0], rows[0]);
        throw new Error('Unknown data format from database');
      }
    }
    
    console.log(`✅ Transformed ${rooms.length} rooms`);
    console.log('🔍 First transformed room:', rooms[0]);
    
    //again dummy data -> should be  removed
    // If all rooms are empty, use dummy data
    if (rooms.length > 0 && (!rooms[0].room_name || rooms[0].room_name.includes('Room '))) {
      console.log('⚠️ All rooms have empty names, using dummy data');
      rooms = [
        { room_id: 1, room_name: 'MAC-1', room_type: 'CLASSROOM', building_id: 1, building_name: 'Adamjee' },
        { room_id: 2, room_name: 'MAC-2', room_type: 'CLASSROOM', building_id: 1, building_name: 'Adamjee' },
        { room_id: 3, room_name: 'BREAKOUT-1', room_type: 'BREAKOUT', building_id: 1, building_name: 'Adamjee' },
        { room_id: 4, room_name: 'AUDITORIUM', room_type: 'CLASSROOM', building_id: 1, building_name: 'Adamjee' },
        { room_id: 5, room_name: 'MCC-9', room_type: 'CLASSROOM', building_id: 2, building_name: 'Aman CED' },
        { room_id: 6, room_name: 'MC-BREAKOUT-1', room_type: 'BREAKOUT', building_id: 2, building_name: 'Aman CED' },
        { room_id: 7, room_name: 'MTC-16', room_type: 'CLASSROOM', building_id: 3, building_name: 'Tabba' },
        { room_id: 8, room_name: 'MT-BREAKOUT-1', room_type: 'BREAKOUT', building_id: 3, building_name: 'Tabba' }
      ];
    }
    
    res.json({
      success: true,
      data: rooms,
      count: rooms.length,
      message: `Found ${rooms.length} rooms across all buildings`
    });
    
  } catch (error) {
    console.error('❌ Error in /api/rooms:', error);
    
    // Provide fallback dummy data
    const dummyRooms = [
      { room_id: 1, room_name: 'MAC-1', room_type: 'CLASSROOM', building_id: 1, building_name: 'Adamjee' },
      { room_id: 2, room_name: 'MAC-2', room_type: 'CLASSROOM', building_id: 1, building_name: 'Adamjee' },
      { room_id: 3, room_name: 'BREAKOUT-1', room_type: 'BREAKOUT', building_id: 1, building_name: 'Adamjee' }
    ];
    
    res.json({
      success: true,
      data: dummyRooms,
      count: dummyRooms.length,
      message: 'Using demo data (database error occurred)',
      demo: true,
      error: error.message
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('🔒 Database connection closed');
      } catch (closeError) {
        console.error('Error closing connection:', closeError);
      }
    }
  }
});

// ============================================
// 2. GET BUILDINGS (simple version)
// ============================================
router.get('/buildings', async (req, res) => {
  console.log('🏛️ GET /api/rooms/buildings called');
  
  const dummyBuildings = [
    { building_id: 1, building_name: 'Adamjee' },
    { building_id: 2, building_name: 'Aman CED' },
    { building_id: 3, building_name: 'Tabba' },
    { building_id: 4, building_name: 'Executive Center' },
    { building_id: 5, building_name: 'Sports Complex' }
  ];
  
  res.json({
    success: true,
    data: dummyBuildings,
    count: dummyBuildings.length,
    message: 'Buildings loaded successfully'
  });
});

// ============================================
// 3. GET ROOM TYPES (simple version)
// ============================================
router.get('/types', async (req, res) => {
  console.log('📋 GET /api/rooms/types called');
  
  const dummyTypes = ['CLASSROOM', 'BREAKOUT'];
  
  res.json({
    success: true,
    data: dummyTypes,
    count: dummyTypes.length,
    message: 'Room types loaded successfully'
  });
});

// ============================================
// 4. GET ROOMS BY BUILDING (simple version)
// ============================================
router.get('/building/:buildingName', async (req, res) => {
  const { buildingName } = req.params;
  console.log(`🏢 GET /api/rooms/building/${buildingName} called`);
  
  const allRooms = [
    { room_id: 1, room_name: 'MAC-1', room_type: 'CLASSROOM', building_id: 1, building_name: 'Adamjee' },
    { room_id: 2, room_name: 'MAC-2', room_type: 'CLASSROOM', building_id: 1, building_name: 'Adamjee' },
    { room_id: 3, room_name: 'BREAKOUT-1', room_type: 'BREAKOUT', building_id: 1, building_name: 'Adamjee' },
    { room_id: 4, room_name: 'AUDITORIUM', room_type: 'CLASSROOM', building_id: 1, building_name: 'Adamjee' },
    { room_id: 5, room_name: 'MCC-9', room_type: 'CLASSROOM', building_id: 2, building_name: 'Aman CED' },
    { room_id: 6, room_name: 'MC-BREAKOUT-1', room_type: 'BREAKOUT', building_id: 2, building_name: 'Aman CED' },
    { room_id: 7, room_name: 'MTC-16', room_type: 'CLASSROOM', building_id: 3, building_name: 'Tabba' },
    { room_id: 8, room_name: 'MT-BREAKOUT-1', room_type: 'BREAKOUT', building_id: 3, building_name: 'Tabba' }
  ];
  
  const filteredRooms = allRooms.filter(room => 
    room.building_name.toLowerCase() === buildingName.toLowerCase()
  );
  
  res.json({
    success: true,
    data: filteredRooms,
    count: filteredRooms.length,
    building: buildingName,
    message: `Found ${filteredRooms.length} rooms in ${buildingName}`
  });
});

// ============================================
// 5. SEARCH ROOMS (simple version)
// ============================================
router.get('/search/:searchTerm', async (req, res) => {
  const { searchTerm } = req.params;
  console.log(`🔍 GET /api/rooms/search/${searchTerm} called`);
  
  const allRooms = [
    { room_id: 1, room_name: 'MAC-1', room_type: 'CLASSROOM', building_id: 1, building_name: 'Adamjee' },
    { room_id: 2, room_name: 'MAC-2', room_type: 'CLASSROOM', building_id: 1, building_name: 'Adamjee' },
    { room_id: 3, room_name: 'BREAKOUT-1', room_type: 'BREAKOUT', building_id: 1, building_name: 'Adamjee' },
    { room_id: 4, room_name: 'AUDITORIUM', room_type: 'CLASSROOM', building_id: 1, building_name: 'Adamjee' },
    { room_id: 5, room_name: 'MCC-9', room_type: 'CLASSROOM', building_id: 2, building_name: 'Aman CED' },
    { room_id: 6, room_name: 'MC-BREAKOUT-1', room_type: 'BREAKOUT', building_id: 2, building_name: 'Aman CED' },
    { room_id: 7, room_name: 'MTC-16', room_type: 'CLASSROOM', building_id: 3, building_name: 'Tabba' },
    { room_id: 8, room_name: 'MT-BREAKOUT-1', room_type: 'BREAKOUT', building_id: 3, building_name: 'Tabba' }
  ];
  
  const filteredRooms = allRooms.filter(room => 
    room.room_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  res.json({
    success: true,
    data: filteredRooms,
    count: filteredRooms.length,
    search_term: searchTerm,
    message: `Found ${filteredRooms.length} rooms matching "${searchTerm}"`
  });
});

module.exports = router;