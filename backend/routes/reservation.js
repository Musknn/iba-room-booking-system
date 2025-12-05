const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");
const { getConnection } = require("../config/database");
router.get("/test", (req, res) => {
  res.json({ message: "Reservation router working" });
});


/* ============================================================
   1) PROGRAM OFFICE — VIEW CLASSROOM RESERVATION HISTORY
============================================================ */
router.get("/po/history", async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `BEGIN 
          ShowReservationHistoryForPO(:cursor); 
       END;`,
      { cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );

    const rows = await result.outBinds.cursor.getRows();

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("PO HISTORY ERROR:", err);
    res.json({ success: false, error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

/* ============================================================
   2) BUILDING INCHARGE — VIEW BREAKOUT RESERVATION HISTORY
============================================================ */
router.get("/bi/history", async (req, res) => {
  let connection;
  const erp = Number(req.query.erp);  // INCHARGE ERP (30001, 30002, etc.)

  if (!erp) {
    return res.json({ success: false, error: "Missing ERP parameter" });
  }

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `BEGIN 
          ShowReservationHistoryForBI(:p_incharge_id, :cursor); 
       END;`,
      {
        p_incharge_id: erp,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );

    const rows = await result.outBinds.cursor.getRows();

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("BI HISTORY ERROR:", err);
    res.json({ success: false, error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

/* ============================================================
   3) STUDENT — VIEW OWN RESERVATION HISTORY
============================================================ */
router.get("/student/history", async (req, res) => {
  let connection;
  const erp = Number(req.query.erp);  // Student ERP

  if (!erp) {
    return res.json({ success: false, error: "Missing ERP parameter" });
  }

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `BEGIN 
          ShowReservationHistoryForStudent(:p_erp, :cursor); 
       END;`,
      {
        p_erp: erp,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );

    const rows = await result.outBinds.cursor.getRows();

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("STUDENT HISTORY ERROR:", err);
    res.json({ success: false, error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

/* ============================================================
   4) REJECT BOOKING (PO or BI)
============================================================ */
router.post("/reject", async (req, res) => {
  let connection;
  const { booking_id, role } = req.body;

  if (!booking_id) {
    return res.json({ success: false, message: "Missing booking ID" });
  }

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `BEGIN 
          RejectBooking(:p_booking_id, :p_role, :p_message); 
       END;`,
      {
        p_booking_id: booking_id,
        p_role: role,
        p_message: { dir: oracledb.BIND_OUT, type: oracledb.STRING }
      }
    );

    res.json({ success: true, message: result.outBinds.p_message });
  } catch (err) {
    console.error("REJECT ERROR:", err);
    res.json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
