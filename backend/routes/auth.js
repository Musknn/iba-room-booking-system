//Necessary imports to create routes.
const express = require('express'); 
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../config/database');

//TO BE REMOVED
//-----------------------------------------------------------------------------------------------------------------------------
//Email Validation to ensure only IBA Students/Admin can login (I think this is redundant as we already check in the database)
const isValidEmailDomain = (email) => {
  const domain = email.split('@')[1];       // ["abc" , "iba.edu.pk"]
  return domain === "iba.edu.pk" || domain === "khi.iba.edu.pk";  
};

//COULD BE MADE PROCEDURE IN THE DATABASE
//To avoid Upper/lower case inconsistencies
// we make sure that the info to/from frontend is always sent converted to a format that is expected by our database.
const formatRole = (role) => {
  if (!role) return null;
  const r = role.toLowerCase();
  if (r === "programoffice") return "ProgramOffice";
  if (r === "buildingincharge") return "BuildingIncharge";
  if (r === "student") return "Student";
  return role;
};

// "/login" is url endpoint (the page where you will be sent to for login)
// router.post defines a POST API endpoint 
//(req, res) => "req" that is sent from the frontend and "res" that we send back to the frontend
router.post('/login', async (req, res) => {
  let connection;
  try {
    const { email, password, userType } = req.body;

    //If the user left any of these fields empty, throw an error.
    if (!email || !password || !userType) {
      return res.status(400).json({ success: false, error: "Email, password & userType are required." });
    }

    //waits for the database connection to establish
    connection = await getConnection();
    console.log(" LOGIN ATTEMPT ");
    console.log({ email, userType });

    //ADMIN LOGIN
    if (userType === "admin") {
      const result = await connection.execute(
        //We create an anonymous block that calls the procedure from database called AdminLogin
        //":variable_name" is a bind variable 
        `BEGIN
            AdminLogin(
              :identifier, 
              :password,
              :success,
              :role,
              :erp,
              :name,
              :message
            );
        END;`,
        {
          //BIND_OUT = output from db, BIND_IN = input to db 
          //Input
          identifier: email,
          password,
          //Output
          success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }, 
          role: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 50 },
          erp: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          name: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
          message: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 300 }
        }
      );

      console.log("ADMIN LOGIN RESULT:", result.outBinds);

      //result.outBinds is the variable returned/output from the stored procedure
      //If the login was successful -> save the role, erp, and name
      if (result.outBinds.success === 1) {
        const correctedRole = formatRole(result.outBinds.role);
        const erp = result.outBinds.erp;
        const name = result.outBinds.name;

        //TO BE MODIFIED IN THE DB AND REMOVED FROM HERE
        //We create a userobj which is initially null and we assign it based on if the admin is BUILDING INCHARGE or PROGRAM
        let userObj = null;

        // ----------If Role(correctedRole) -> Building Incharge ----------
        if (correctedRole === "BuildingIncharge") {
          //We save the user related information in the object that will be shown on the frontend.
          userObj = {
            INCHARGE_ID: erp,  
            NAME: name,
            EMAIL: email,
            ROLE: correctedRole
          };
        }

        // ----------If Role(correctedRole) -> Program Office ----------
        else if (correctedRole === "ProgramOffice") {
          //We save the user related information in the object that will be shown on the frontend.
          userObj = {
            PROGRAM_OFFICE_ID: erp,  
            NAME: name,
            EMAIL: email,
            ROLE: correctedRole
          };
        }
        
        //Gives out the response
        return res.json({
          success: true,
          userType: "admin",
          role: correctedRole,
          user: userObj,
          message: "Admin login successful"
        });
      }

      //If success = false -> Throw error.
      return res.status(401).json({
        success: false,
        error: result.outBinds.message || "Invalid admin credentials"
      });
    }

    // STUDENT LOGIN
    if (userType === "student") {
      const studentResult = await connection.execute(
        // Called STUDENTLOGIN inside an anonymous PL/SQL to check studentlogin
        `BEGIN
            StudentLogin(
              :identifier,
              :password,
              :success,
              :erp,
              :name,
              :program,
              :intake_year,
              :message
            );
        END;`,
        {
          //Input
          identifier: email,
          password,
          //Output
          success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          erp: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          name: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 100 },
          program: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 100 },
          intake_year: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          message: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 300 }
        }
      );

      console.log("STUDENT RESULT:", studentResult.outBinds);

      //if the result is successful - send the response.
      if (studentResult.outBinds.success === 1) {
        return res.json({
          success: true,
          userType: "student",
          role: "Student",
          user: {
            erp: studentResult.outBinds.erp,
            name: studentResult.outBinds.name,
            email,
            program: studentResult.outBinds.program,
            intakeYear: studentResult.outBinds.intake_year
          },
          message: "Student login successful"
        });
      }

      //TO BE REMOVED
      // Check if student exists - redundant (we have this as a procedure in database)
      const userCheck = await connection.execute(
        `SELECT COUNT(*) AS CNT FROM User_Table WHERE email = :email AND role = 'Student'`,
        { email }
      );

      //it is checking if student exists or not so that it can decide what error to throw
      const exists = userCheck.rows[0].CNT === 1;

      //if success==false and exists = 0 -> it means that the student does not exist in the database
      //if success==false and exists = 1 -> it means that the student does exist but the credentials are incorrect due to which login failed.
      return res.status(401).json({
        success: false,
        error: studentResult.outBinds.message || (exists ? "Invalid password" : "Student not found")
      });
    }

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    if (connection) await connection.close().catch(() => {});
  }
});

// ------------------------------
// ADDITIONAL AUTH ROUTES (Optional - you can add later)
// ------------------------------
router.post('/register', async (req, res) => {
  res.json({ message: 'Register endpoint - to be implemented' });
});

router.post('/verify', async (req, res) => {
  res.json({ message: 'Verify endpoint - to be implemented' });
});

router.get('/check-user', async (req, res) => {
  res.json({ message: 'Check user endpoint - to be implemented' });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'Auth route working',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
