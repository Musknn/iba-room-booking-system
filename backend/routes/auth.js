// routes/auth.js
const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../config/database');

// Email validation function
const isValidEmailDomain = (email, type) => {
  const domain = email.split('@')[1];
  const allowedDomains = ['iba.edu.pk', 'khi.iba.edu.pk'];
  return allowedDomains.includes(domain);
};

// User Login (Admin + Student)
router.post('/login', async (req, res) => {
  let connection;
  try {
    const { email, password, userType } = req.body;
    
    // Validate input
    if (!email || !password || !userType) {
      return res.status(400).json({ 
        success: false,
        error: 'Email, password, and user type are required' 
      });
    }

    // Validate email domain for login
    if (!isValidEmailDomain(email, 'login')) {
      return res.status(400).json({ 
        success: false,
        error: 'Please use @iba.edu.pk or @khi.iba.edu.pk email address' 
      });
    }

    connection = await getConnection();
    
    console.log('Login attempt:', { email, userType });

    // For admin users
    if (userType === 'admin') {
      const result = await connection.execute(
        `BEGIN
           admin_login(:email, :password, :success, :role, :erp, :name);
         END;`,
        {
          email: email,
          password: password,
          success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          role: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 50 },
          erp: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          name: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 100 }
        }
      );
      
      const success = result.outBinds.success;
      const role = result.outBinds.role;
      
      console.log('Admin login result:', result.outBinds);
      
      if (success === 1) {
        return res.json({ 
          success: true, 
          userType: 'admin',
          role: role,
          user: {
            erp: result.outBinds.erp,
            name: result.outBinds.name,
            email: email
          },
          message: 'Admin login successful'
        });
      } else {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid admin credentials' 
        });
      }
    }
    
    // For student login - USING THE WORKING PROCEDURE
    console.log('Attempting student login for:', email);
    
    const studentResult = await connection.execute(
      `BEGIN
         student_login(:email, :password, :success, :erp, :name, :program, :intake_year);
       END;`,
      {
        email: email,
        password: password,
        success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        erp: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        name: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 100 },
        program: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 100 },
        intake_year: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    console.log('Student login procedure result:', studentResult.outBinds);

    const success = studentResult.outBinds.success;
    const erp = studentResult.outBinds.erp;
    const name = studentResult.outBinds.name;
    const program = studentResult.outBinds.program;
    const intake_year = studentResult.outBinds.intake_year;

    if (success === 1) {
      return res.json({ 
        success: true, 
        userType: 'student',
        role: 'student',
        user: {
          erp: erp,
          name: name,
          email: email,
          program: program,
          intakeYear: intake_year
        },
        message: 'Login successful'
      });
    } else {
      // Additional check to see if user exists but credentials are wrong
      const userCheck = await connection.execute(
        `SELECT COUNT(*) as user_count 
         FROM User_Table 
         WHERE email = :email 
         AND role = 'student'`,
        { email }
      );

      const userExists = userCheck.rows[0].USER_COUNT > 0;
      
      if (userExists) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid password' 
        });
      } else {
        return res.status(401).json({ 
          success: false, 
          error: 'Student account not found with this email' 
        });
      }
    }

  } catch (error) {
    console.error('Login error:', {
      message: error.message,
      stack: error.stack,
      errorNumber: error.errorNum,
      offset: error.offset
    });
    
    // Handle specific Oracle errors
    if (error.message.includes('PLS-00306')) {
      return res.status(500).json({ 
        success: false,
        error: 'Database procedure error. Please contact administrator.' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Login failed: ' + error.message 
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Connection close error:', err);
      }
    }
  }
});

// Test route to verify database connection and procedure
router.get('/test-login', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    
    // Test the student_login procedure directly
    const result = await connection.execute(
      `BEGIN
         student_login('student1@khi.iba.edu.pk', 'password123', :success, :erp, :name, :program, :intake_year);
       END;`,
      {
        success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        erp: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        name: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 100 },
        program: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 100 },
        intake_year: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    res.json({
      success: true,
      testResult: result.outBinds,
      message: 'Procedure test completed successfully'
    });

  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Test failed: ' + error.message 
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

module.exports = router;