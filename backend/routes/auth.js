const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../config/database');

// Helper function to format role
const formatRole = (role) => {
  if (!role) return null;
  const r = role.toLowerCase();
  if (r === "programoffice") return "ProgramOffice";
  if (r === "buildingincharge") return "BuildingIncharge";
  if (r === "student") return "Student";
  return role;
};

// LOGIN ENDPOINT
router.post('/login', async (req, res) => {
  let connection;
  try {
    const { email, password, userType } = req.body;

    if (!email || !password || !userType) {
      return res.status(400).json({ success: false, error: "Email, password & userType are required." });
    }

    connection = await getConnection();
    console.log("LOGIN ATTEMPT:", { email, userType });

    // ADMIN LOGIN (ProgramOffice or BuildingIncharge)
    if (userType === "admin") {
      const result = await connection.execute(
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
          identifier: email,
          password,
          success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          role: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 50 },
          erp: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          name: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
          message: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 300 }
        }
      );

      console.log("ADMIN LOGIN RESULT:", result.outBinds);

      if (result.outBinds.success === 1) {
        const correctedRole = formatRole(result.outBinds.role);
        const erp = result.outBinds.erp;
        const name = result.outBinds.name;

        let userObj = null;

        if (correctedRole === "BuildingIncharge") {
          userObj = {
            INCHARGE_ID: erp,
            NAME: name,
            EMAIL: email,
            ROLE: correctedRole
          };
        } else if (correctedRole === "ProgramOffice") {
          userObj = {
            PROGRAM_OFFICE_ID: erp,
            NAME: name,
            EMAIL: email,
            ROLE: correctedRole
          };
        }

        return res.json({
          success: true,
          userType: "admin",
          role: correctedRole,
          user: userObj,
          message: "Admin login successful"
        });
      }

      return res.status(401).json({
        success: false,
        error: result.outBinds.message || "Invalid admin credentials"
      });
    }

    // STUDENT LOGIN
    if (userType === "student") {
      const studentResult = await connection.execute(
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
          identifier: email,
          password,
          success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          erp: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          name: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 100 },
          program: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 100 },
          intake_year: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          message: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 300 }
        }
      );

      console.log("STUDENT RESULT:", studentResult.outBinds);

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

      return res.status(401).json({
        success: false,
        error: studentResult.outBinds.message || "Invalid credentials"
      });
    }

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    if (connection) await connection.close().catch(() => {});
  }
});

// REGISTRATION ENDPOINT (DIRECT - NO OTP)
router.post('/register', async (req, res) => {
  let connection;
  try {
    const { erp, name, email, password, phoneNumber, program, intakeYear } = req.body;

    if (!erp || !name || !email || !password || !phoneNumber || !program || !intakeYear) {
      return res.status(400).json({ success: false, error: "All fields are required." });
    }

    connection = await getConnection();
    console.log("REGISTER ATTEMPT:", { erp, name, email });

    // Call RegisterStudent procedure (direct registration)
    const result = await connection.execute(
      `BEGIN
          RegisterStudent(
            :p_erp,
            :p_name,
            :p_email,
            :p_password,
            :p_phonenumber,
            :p_program,
            :p_intake_year,
            :p_success,
            :p_message
          );
      END;`,
      {
        p_erp: parseInt(erp),
        p_name: name,
        p_email: email,
        p_password: password,
        p_phonenumber: phoneNumber,
        p_program: program,
        p_intake_year: parseInt(intakeYear),
        p_success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        p_message: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 }
      }
    );

    console.log("REGISTRATION RESULT:", result.outBinds);

    if (result.outBinds.p_success === 1) {
      return res.json({
        success: true,
        message: result.outBinds.p_message || "Registration successful"
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.outBinds.p_message || "Registration failed"
      });
    }

  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    if (connection) await connection.close().catch(() => {});
  }
});

// PASSWORD RESET ENDPOINT (DIRECT - NO OTP)
router.post('/reset-password', async (req, res) => {
  let connection;
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ success: false, error: "Email and new password are required." });
    }

    connection = await getConnection();
    console.log("PASSWORD RESET ATTEMPT:", { email });

    // Call ResetPasswordDirect procedure
    const result = await connection.execute(
      `BEGIN
          ResetPasswordDirect(
            :p_email,
            :p_new_password,
            :p_success,
            :p_message
          );
      END;`,
      {
        p_email: email,
        p_new_password: newPassword,
        p_success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        p_message: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 }
      }
    );

    console.log("PASSWORD RESET RESULT:", result.outBinds);

    if (result.outBinds.p_success === 1) {
      return res.json({
        success: true,
        message: result.outBinds.p_message || "Password reset successful"
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.outBinds.p_message || "Password reset failed"
      });
    }

  } catch (err) {
    console.error("Password reset error:", err);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    if (connection) await connection.close().catch(() => {});
  }
});

// CHECK USER EXISTS (for registration validation)
router.post('/check-user', async (req, res) => {
  let connection;
  try {
    const { email, phoneNumber } = req.body;

    connection = await getConnection();

    const result = await connection.execute(
      `BEGIN
          CheckUserExists(
            :p_email,
            :p_phonenumber,
            :p_user_exists,
            :p_message
          );
      END;`,
      {
        p_email: email,
        p_phonenumber: phoneNumber,
        p_user_exists: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        p_message: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 }
      }
    );

    return res.json({
      success: true,
      userExists: result.outBinds.p_user_exists === 1,
      message: result.outBinds.p_message
    });

  } catch (err) {
    console.error("Check user error:", err);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    if (connection) await connection.close().catch(() => {});
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'Auth route working',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;