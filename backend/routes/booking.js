// routes/booking.js
const express = require('express');
const router = express.Router();
const oracledb = require('oracledb'); // Add this import
const { getConnection } = require('../config/database');

// Get available rooms
router.get('/available-rooms', async (req, res) => {
    let connection;
    try {
        const { date, startTime, endTime, buildingId, roomType } = req.query;
        
        // Validate required fields
        if (!date || !startTime || !endTime || !buildingId || !roomType) {
            return res.status(400).json({ 
                error: 'Date, start time, end time, building, and room type are required' 
            });
        }

        connection = await getConnection();
        
        const result = await connection.execute(
            `BEGIN get_available_rooms(:date, :startTime, :endTime, :buildingId, :roomType, :cursor); END;`,
            {
                date: new Date(date),
                startTime: startTime,
                endTime: endTime,
                buildingId: parseInt(buildingId),
                roomType: roomType,
                cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
            }
        );

        const resultSet = result.outBinds.cursor;
        const availableRooms = await resultSet.getRows();
        await resultSet.close();

        res.json({ success: true, data: availableRooms });
        
    } catch (error) {
        console.error('Error fetching available rooms:', error);
        res.status(500).json({ error: 'Failed to fetch available rooms' });
    } finally {
        if (connection) await connection.close();
    }
});

// Create booking
router.post('/create-booking', async (req, res) => {
    let connection;
    try {
        const { erp, roomId, date, startTime, endTime, purpose } = req.body;
        
        // Validate all fields
        if (!erp || !roomId || !date || !startTime || !endTime || !purpose) {
            return res.status(400).json({ 
                error: 'All fields are required' 
            });
        }

        connection = await getConnection();
        
        const result = await connection.execute(
            `BEGIN create_booking(:erp, :roomId, :date, :startTime, :endTime, :purpose, :bookingId, :success, :message); END;`,
            {
                erp: parseInt(erp),
                roomId: parseInt(roomId),
                date: new Date(date),
                startTime: startTime,
                endTime: endTime,
                purpose: purpose,
                bookingId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
                success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
                message: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 }
            }
        );

        const success = result.outBinds.success;
        const message = result.outBinds.message;

        if (success === 1) {
            res.json({ 
                success: true, 
                message: message,
                bookingId: result.outBinds.bookingId
            });
        } else {
            res.status(400).json({ 
                success: false, 
                error: message 
            });
        }
        
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ error: 'Failed to create booking' });
    } finally {
        if (connection) await connection.close();
    }
});

module.exports = router;