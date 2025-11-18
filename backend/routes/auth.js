const express = require('express');
const oracledb = require('oracledb');
const { getConnection } = require('../config/database');
const router = express.Router();

// Email validation functions
const isValidEmailDomain = (email, userType) => {
  const validDomains = ['@iba.edu.pk', '@khi.iba.edu.pk'];
  
  if (userType === 'student') {
    // Students can only use @khi.iba.edu.pk
    return email.endsWith('@khi.iba.edu.pk');
  } else {
    // Admin/Login can use both domains
    return validDomains.some(domain => email.endsWith(domain));
  }
};

// Check user status before login/registration
router.post('/check-user', async (req, res) => {
  let connection;
  try {
    const { email, userType } = req.body;
    
    connection = await getConnection();
    
    const result = await connection.execute(
      `DECLARE
         v_user_exists NUMBER;
         v_is_pending NUMBER;
       BEGIN
         check_user_exists(:email, :userType, :user_exists, :is_pending);
       END;`,
      {
        email: email,
        userType: userType,
        user_exists: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        is_pending: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );
    
    res.json({
      userExists: result.outBinds.user_exists === 1,
      isPending: result.outBinds.is_pending === 1
    });
    
  } catch (error) {
    console.error('Check user error:', error);
    res.status(500).json({ error: 'Failed to check user status' });
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

// Student login
router.post('/student-login', async (req, res) => {
  let connection;
  try {
    const { email, password } = req.body;
    
    connection = await getConnection();
    
    const result = await connection.execute(
      `DECLARE
         v_success NUMBER;
         v_erp NUMBER;
         v_name VARCHAR2(100);
       BEGIN
         student_login(:email, :password, :success, :erp, :name);
       END;`,
      {
        email: email,
        password: password,
        success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        erp: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        name: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 100 }
      }
    );
    
    if (result.outBinds.success === 1) {
      res.json({
        success: true,
        userType: 'student',
        user: {
          erp: result.outBinds.erp,
          name: result.outBinds.name,
          email: email
        },
        message: 'Login successful'
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ error: 'Login failed' });
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

// Student Registration
router.post('/register', async (req, res) => {
  let connection;
  try {
    const { erp, name, email, password, role } = req.body;
    
    // Only allow student registration
    if (role !== 'student') {
      return res.status(400).json({ error: 'Only students can register' });
    }

    // Validate email domain for registration
    if (!isValidEmailDomain(email, 'student')) {
      return res.status(400).json({ 
        error: 'Student registration requires @khi.iba.edu.pk email address' 
      });
    }

    connection = await getConnection();
    
    const result = await connection.execute(
      `DECLARE
         v_code VARCHAR2(10);
       BEGIN
         insert_pending_registration(:erp, :name, :email, :password, :role, :code);
       END;`,
      {
        erp: parseInt(erp),
        name: name,
        email: email,
        password: password,
        role: role,
        code: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 10 }
      }
    );
    
    res.json({ 
      success: true, 
      message: 'Verification code sent to your email',
      verificationCode: result.outBinds.code, // For testing - remove in production
      note: 'In production, email would be sent. Check backend logs for code.'
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    if (error.message.includes('ORA-20001')) {
      res.status(400).json({ error: 'Student registration requires @khi.iba.edu.pk email address' });
    } else if (error.message.includes('ORA-20002')) {
      res.status(400).json({ error: 'ERP number already registered' });
    } else {
      res.status(500).json({ error: 'Registration failed: ' + error.message });
    }
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

// Verify OTP and complete registration
router.post('/verify', async (req, res) => {
  let connection;
  try {
    const { email, verificationCode } = req.body;
    
    connection = await getConnection();
    
    const result = await connection.execute(
      `DECLARE
         v_success NUMBER;
         v_message VARCHAR2(200);
       BEGIN
         verify_registration(:email, :code, :success, :message);
       END;`,
      {
        email: email,
        code: verificationCode,
        success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        message: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 }
      }
    );
    
    const success = result.outBinds.success;
    const message = result.outBinds.message;
    
    if (success === 1) {
      res.json({ success: true, message: message });
    } else {
      res.status(400).json({ success: false, error: message });
    }
    
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Verification failed: ' + error.message });
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

// Resend verification code
router.post('/resend-code', async (req, res) => {
  let connection;
  try {
    const { email } = req.body;
    
    connection = await getConnection();
    
    const result = await connection.execute(
      `DECLARE
         v_new_code VARCHAR2(10);
         v_success NUMBER;
       BEGIN
         resend_verification_code(:email, :new_code, :success);
       END;`,
      {
        email: email,
        new_code: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 10 },
        success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );
    
    if (result.outBinds.success === 1) {
      res.json({ 
        success: true, 
        message: 'New verification code sent',
        verificationCode: result.outBinds.new_code // For testing - remove in production
      });
    } else {
      res.status(400).json({ success: false, error: 'Failed to resend code' });
    }
    
  } catch (error) {
    console.error('Resend code error:', error);
    res.status(500).json({ error: 'Failed to resend code: ' + error.message });
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

// User Login (Admin + Student)
router.post('/login', async (req, res) => {
  let connection;
  try {
    const { email, password, userType } = req.body;
    
    // Validate email domain for login
    if (!isValidEmailDomain(email, 'login')) {
      return res.status(400).json({ 
        error: 'Please use @iba.edu.pk or @khi.iba.edu.pk email address' 
      });
    }

    connection = await getConnection();
    
    // For admin users, use hardcoded credentials
    if (userType === 'admin') {
      const adminCredentials = {
        'programoffice@iba.edu.pk': { password: 'IBAProgram2024', role: 'program-office' },
        'buildingincharge@iba.edu.pk': { password: 'IBABuilding2024', role: 'building-incharge' }
      };
      
      if (adminCredentials[email] && adminCredentials[email].password === password) {
        return res.json({ 
          success: true, 
          userType: 'admin',
          role: adminCredentials[email].role,
          message: 'Admin login successful'
        });
      } else {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid admin credentials' 
        });
      }
    }
    
    // For student login, use the student_login procedure
    const result = await connection.execute(
      `DECLARE
         v_success NUMBER;
         v_erp NUMBER;
         v_name VARCHAR2(100);
       BEGIN
         student_login(:email, :password, :success, :erp, :name);
       END;`,
      {
        email: email,
        password: password,
        success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        erp: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        name: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 100 }
      }
    );
    
    if (result.outBinds.success === 1) {
      res.json({ 
        success: true, 
        userType: 'student',
        role: 'student',
        user: {
          erp: result.outBinds.erp,
          name: result.outBinds.name,
          email: email
        },
        message: 'Login successful'
      });
    } else {
      res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed: ' + error.message });
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