//necessary imports
const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../config/database');

/* ============================================================
   HELPER — Convert Oracle Row → Proper Announcement Object
============================================================ */
function formatAnnouncement(row) {
  // CASE 1: Oracle returns OBJECT
  if (row && typeof row === "object" && !Array.isArray(row)) {
    return {
      announcement_id: row.ANNOUNCEMENT_ID ?? 0,
      title: row.TITLE ?? "No Title",
      description: row.DESCRIPTION ?? "No Description",
      date_posted: row.DATE_POSTED
        ? new Date(row.DATE_POSTED).toISOString()
        : new Date().toISOString(),
      created_date: row.CREATED_DATE
        ? new Date(row.CREATED_DATE).toISOString()
        : null,
      posted_by: row.POSTED_BY ?? "",
      building_name: row.BUILDING_NAME ?? ""
    };
  }

  // CASE 2: Oracle returns ARRAY
  if (Array.isArray(row)) {
    return {
      announcement_id: row[0] ?? 0,
      title: row[1] ?? "No Title",
      description: row[2] ?? "No Description",
      date_posted: row[3]
        ? new Date(row[3]).toISOString()
        : new Date().toISOString(),
      created_date: row[4]
        ? new Date(row[4]).toISOString()
        : null,
      posted_by: row[5] ?? "",
      building_name: row[6] ?? ""
    };
  }

  // FAILSAFE
  return {
    announcement_id: 0,
    title: "Error loading",
    description: "Could not parse announcement",
    date_posted: new Date().toISOString(),
    created_date: null
  };
}

//All announcements for the students
router.get('/all', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      //calls the stored procedure from our database "ShowAllAnnouncements"
      //no input -> outputs a cursor
      `BEGIN ShowAllAnnouncements(:cursor); END;`,
      { cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );

    const rs = result.outBinds.cursor;
    const rows = await rs.getRows();

    await rs.close();

    const formatted = rows.map(formatAnnouncement);

    return res.json({ success: true, data: formatted });

  } catch (err) {
    console.error("❌ Error in /all:", err);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

/* ============================================================
   2) GET ANNOUNCEMENTS BY BUILDING
============================================================ */
router.get('/building/:name', async (req, res) => {
  let connection;
  try {
    const building = req.params.name;

    connection = await getConnection();

    const result = await connection.execute(
      `BEGIN FilterAnnouncementsByBuilding(:bname, :cursor); END;`,
      {
        bname: building,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );

    const rs = result.outBinds.cursor;
    const rows = await rs.getRows();

    await rs.close();

    const formatted = rows.map(formatAnnouncement);

    return res.json({ success: true, data: formatted });

  } catch (err) {
    console.error("❌ Error in /building:", err);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

/* ============================================================
   3) GET ANNOUNCEMENTS POSTED BY SPECIFIC INCHARGE (ERP)
============================================================ */
router.get('/incharge/:erp', async (req, res) => {
  let connection;

  try {
    const { erp } = req.params;

    connection = await getConnection();

    const result = await connection.execute(
      `BEGIN ShowAnnouncementsByUser(:erp, :cursor); END;`,
      {
        erp: parseInt(erp),
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );

    const rs = result.outBinds.cursor;
    const rows = await rs.getRows();
    await rs.close();

    console.log("🔍 Raw rows from Oracle:", rows);

    const formatted = rows.map(formatAnnouncement);

    console.log("✅ Formatted announcements:", formatted);

    return res.json({ success: true, data: formatted });

  } catch (err) {
    console.error("❌ Error in /incharge:", err);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

/* ============================================================
   4) POST ANNOUNCEMENT (BUILDING INCHARGE)
============================================================ */
router.post('/post', async (req, res) => {
  let connection;

  try {
    const { erp, title, description } = req.body;

    if (!erp || !title || !description) {
      return res.status(400).json({
        success: false,
        error: "ERP, title and description are required"
      });
    }

    connection = await getConnection();

    const result = await connection.execute(
      `BEGIN 
         PostAnnouncement(:erp, :title, :desc, :success, :message); 
       END;`,
      {
        erp: parseInt(erp),
        title,
        desc: description,
        success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        message: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 300 }
      }
    );

    if (result.outBinds.success === 1) {
      return res.json({ success: true, message: result.outBinds.message });
    }

    return res.status(400).json({
      success: false,
      error: result.outBinds.message
    });

  } catch (err) {
    console.error("❌ Error posting announcement:", err);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

/* ============================================================
   5) DELETE ANNOUNCEMENT
============================================================ */
router.post('/delete', async (req, res) => {
  let connection;

  try {
    const { announcement_id, erp } = req.body;

    connection = await getConnection();

    const result = await connection.execute(
      `BEGIN 
         DeleteAnnouncement(:aid, :erp, :success, :message); 
       END;`,
      {
        aid: parseInt(announcement_id),
        erp: parseInt(erp),
        success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        message: { dir: oracledb.BIND_OUT, type: oracledb.STRING }
      }
    );

    if (result.outBinds.success === 1) {
      return res.json({ success: true, message: result.outBinds.message });
    }

    return res.status(400).json({
      success: false,
      error: result.outBinds.message
    });

  } catch (err) {
    console.error("❌ Error deleting announcement:", err);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
