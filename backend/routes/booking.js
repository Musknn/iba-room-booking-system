// routes/booking.js

//All the necessary imports
const express = require('express');
const router = express.Router();
const oracledb = require('oracledb'); 
const { getConnection } = require('../config/database');


//GET API endpoint
router.get('/available-rooms', async (req, res) => {
    let connection;
    try {
        //we extract this information from the request sent by the frontend which will be used in the PL/SQL block.
        const { date, startTime, endTime, buildingId, roomType } = req.query;

        connection = await getConnection();

        const result = await connection.execute(
            //anonymous PL/SQL block calls the stored PL/SQL "get_available_rooms" block from the database
            `BEGIN get_available_rooms(:date, :startTime, :endTime, :buildingId, :roomType, :cursor); END;`, //this outputs a cursor
            {
                date: new Date(date + "T00:00:00"),
                startTime,
                endTime,
                buildingId: Number(buildingId),
                roomType: roomType.toUpperCase(),
                cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } 
            }
        );

        const rs = result.outBinds.cursor; //extracts the returned cursor 
        const rooms = await rs.getRows(500); //fetched 500 rows from the cursor
        await rs.close();   //closing cursor

        res.json({ success: true, data: rooms }); //sends the found rooms to the frontend

    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch available rooms' }); //if success = false => throw error
    }
});

//POST API to create booking request
router.post('/create-booking', async (req, res) => {
    let connection;
    try {
        //extracts data from the request
        const { erp, roomId, date, startTime, endTime, purpose } = req.body;

        connection = await getConnection();

        const result = await connection.execute(
            //anonymous procedure calling the stored procedure "create_booking" from the database
            `BEGIN create_booking(:erp, :roomId, :date, :startTime, :endTime, :purpose, :bookingId, :success, :message); END;`,
            {
                erp: Number(erp),
                roomId: Number(roomId),
                date: new Date(date + "T00:00:00"),
                startTime,
                endTime,
                purpose,
                bookingId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
                success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
                message: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 300 }
            }
        );

        //if success==1, send booking id.
        if (result.outBinds.success === 1) {
            return res.json({
                success: true,
                message: result.outBinds.message,
                bookingId: result.outBinds.bookingId
            });
        }

        //if false, throw error msg
        res.status(400).json({
            success: false,
            error: result.outBinds.message
        });

    } catch (err) {
        res.status(500).json({ error: 'Failed to create booking' });
    }
});

module.exports = router;