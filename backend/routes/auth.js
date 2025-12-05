// src/routes/auth.js

const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../config/database');

// ------------------------------
// Email Domain Validation
// ------------------------------
const isValidEmailDomain = (email) => {
  const domain = email.split('@')[1];
  return domain === "iba.edu.pk" || domain === "khi.iba.edu.pk";
};

// ------------------------------
// FORMAT ROLE FOR FRONTEND
// ------------------------------
const formatRole = (role) => {
  if (!role) return null;

  const r = role.toLowerCase();

  if (r === "programoffice") return "ProgramOffice";
  if (r === "buildingincharge") return "BuildingIncharge";
  if (r === "student") return "Student";

  return role;
};

// ------------------------------
// LOGIN ROUTE (Admin + Student)
// ------------------------------
router.post('/login', async (req, res) => {
  let connection;

  try {
    const { email, password, userType } = req.body;

    if (!email || !password || !userType) {
      return res.status(400).json({ success: false, error: "Email, password & userType are required." });
    }

    if (!isValidEmailDomain(email)) {
      return res.status(400).json({ success: false, error: "Use @iba.edu.pk or @khi.iba.edu.pk email." });
    }

    connection = await getConnection();
    console.log("\n=== LOGIN ATTEMPT ===");
    console.log({ email, userType });

    // ====================================================
    // ADMIN LOGIN (Program Office + BI)
    // ====================================================
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

        // ---------- Building Incharge ----------
        if (correctedRole === "BuildingIncharge") {
          userObj = {
            INCHARGE_ID: erp,   // IMPORTANT: used in frontend BI history
            NAME: name,
            EMAIL: email,
            ROLE: correctedRole
          };
        }

        // ---------- Program Office ----------
        else if (correctedRole === "ProgramOffice") {
          userObj = {
            PROGRAM_OFFICE_ID: erp,  // IMPORTANT: used in PO functions
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

    // ====================================================
    // STUDENT LOGIN
    // ====================================================
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

      // Check if student exists
      const userCheck = await connection.execute(
        `SELECT COUNT(*) AS CNT FROM User_Table WHERE email = :email AND role = 'Student'`,
        { email }
      );

      const exists = userCheck.rows[0].CNT === 1;

      return res.status(401).json({
        success: false,
        error: studentResult.outBinds.message || (exists ? "Invalid password" : "Student not found")
      });
    }

  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    if (connection) await connection.close().catch(() => {});
  }
});

// ------------------------------
// EXPORT ROUTER
// ------------------------------
module.exports = router;
