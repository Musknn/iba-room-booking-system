// routes/booking.js
const express = require('express');
const router = express.Router();
const oracledb = require('oracledb'); // Add this import
const { getConnection } = require('../config/database');

router.get('/available-rooms', async (req, res) => {
    let connection;
    try {
        const { date, startTime, endTime, buildingId, roomType } = req.query;

        connection = await getConnection();

        const result = await connection.execute(
            `BEGIN get_available_rooms(:date, :startTime, :endTime, :buildingId, :roomType, :cursor); END;`,
            {
                date: new Date(date + "T00:00:00"),
                startTime,
                endTime,
                buildingId: Number(buildingId),
                roomType: roomType.toUpperCase(),
                cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
            }
        );

        const rs = result.outBinds.cursor;
        const rooms = await rs.getRows(500);
        await rs.close();

        res.json({ success: true, data: rooms });

    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch available rooms' });
    }
});
router.post('/create-booking', async (req, res) => {
    let connection;
    try {
        const { erp, roomId, date, startTime, endTime, purpose } = req.body;

        connection = await getConnection();

        const result = await connection.execute(
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

        if (result.outBinds.success === 1) {
            return res.json({
                success: true,
                message: result.outBinds.message,
                bookingId: result.outBinds.bookingId
            });
        }

        res.status(400).json({
            success: false,
            error: result.outBinds.message
        });

    } catch (err) {
        res.status(500).json({ error: 'Failed to create booking' });
    }
});

module.exports = router;