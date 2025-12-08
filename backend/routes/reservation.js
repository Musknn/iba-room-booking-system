const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");
const { getConnection } = require("../config/database");
router.get("/test", (req, res) => {
  res.json({ message: "Reservation router working" });
});

//RESERVATION HISTORY -> FOR PO (shows the booking of the classrooms only)
//url "/po/history"
//GET API endpoint
router.get("/po/history", async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      //in an anonymous block -> we call the stored procedure "ShowReservationHistoryForPO" from the database
      `BEGIN 
          ShowReservationHistoryForPO(:cursor); 
       END;`,
       //outputs a cursor 
      { cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );

    //we save the resultant rows
    const rows = await result.outBinds.cursor.getRows();

    //if no error, we send the response to the frontend
    res.json({ success: true, data: rows });
  } 
  //if error -> throw error msg
  catch (err) {
    console.error("PO HISTORY ERROR:", err);
    res.json({ success: false, error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

//Building Incharge Reservation History -> can only view the booking history of the breakout rooms.
//url "/bi/history"
//GET API endpoint

router.get("/bi/history", async (req, res) => {
  let connection;

  //we will need erp for this as the history for each building incharge will be dependent on their id as the can ony view 
  //the booking history of their own building
  // so extracting the erp here so that we can send it as an input the PL/SQL procedure
  const inchargeId = Number(req.query.erp);  

  //If there is no InchargeID -> throw error msg as ID is important for this feature (BI)
  if (!inchargeId) {
    return res.json({ success: false, error: "Missing Building Incharge ERP" });
  }

  try {
    connection = await getConnection();

    const result = await connection.execute(
      //In an anonymous block, we call th stored procedure "ShowReservationHistoryForBI" from the database 
      //this takes incharge_id as input and outputs a cursor 
      //why cursor = becus the result contains multiple rows
      `BEGIN 
          ShowReservationHistoryForBI(:p_incharge_id, :cursor); 
       END;`,
      {
        //input
        p_incharge_id: inchargeId,
        //output
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

//Student Booking History -> student can view his/her booking history
// url "/student/history"
// GET API endpoint
router.get("/student/history", async (req, res) => {
  let connection;

  //we extract the erp of the student as it is important for this feature
  //because the student can only view his/her history for which ERP/Student_id is required
  const erp = Number(req.query.erp);  // Student ERP

  //If no erp -> send an error msg -> missing ERP
  if (!erp) {
    return res.json({ success: false, error: "Missing ERP parameter" });
  }

  try {
    connection = await getConnection();

    const result = await connection.execute(
      //In an anonymous block, we call the stored Procedure "ShowReservationHistoryForStudent" from our database
      //it takes erp as input and outputs a cursor (multiple rows)
      `BEGIN 
          ShowReservationHistoryForStudent(:p_erp, :cursor); 
       END;`,
      {
        //input
        p_erp: erp,
        //ouput
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );

    const rows = await result.outBinds.cursor.getRows();

    //if successful -> show the relevant rows else error
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("STUDENT HISTORY ERROR:", err);
    res.json({ success: false, error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});


//Reject Booking 
//url "/reject"
//POST API endpoint
router.post("/reject", async (req, res) => {
  let connection;

  //we extract the booking_id and the role from the request 
  // the booking_id because we need to know which booking to cancel
  // role to ensure that no student can reject a booking and to ensure that BI only rejects a breakout room booking
  //similarly, po can only reject the classroom bookings.
  const { booking_id, role } = req.body;

  // if no booking_id given -> throw error
  if (!booking_id) {
    return res.json({ success: false, message: "Missing booking ID" });
  }

  try {
    connection = await getConnection();

    const result = await connection.execute(
      //In the anonymous block -> we call out stored procedure "RejectBooking" from the database
      //this takes the booking_id and role as input
      `BEGIN 
          RejectBooking(:p_booking_id, :p_role, :p_message); 
       END;`,
      {
        //input:
        p_booking_id: booking_id,
        p_role: role,
        //output
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
