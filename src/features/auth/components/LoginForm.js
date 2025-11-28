// src/features/auth/components/LoginForm.js
import React, { useState } from 'react';
import Button from '../../../shared/components/ui/Button';
import UserTypeSelector from './UserTypeSelector';
import OTPScreen from './OTPScreen';
import ForgotPassword from './ForgotPassword';

const LoginForm = ({ onLogin, onUserTypeChange }) => {
  const [isNewUser, setIsNewUser] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [userType, setUserType] = useState('student');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
    studentId: ''  // ERP number for students
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
    if (onUserTypeChange) {
      onUserTypeChange(type);
    }
  };

  // Email validation function
  const validateEmailDomain = (email, isRegistration = false) => {
    if (isRegistration && userType === 'student') {
      // Student registration: only @khi.iba.edu.pk
      return email.endsWith('@khi.iba.edu.pk');
    } else {
      // Login: both domains allowed
      return email.endsWith('@iba.edu.pk') || email.endsWith('@khi.iba.edu.pk');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate email domain FIRST
      if (!validateEmailDomain(formData.email, isNewUser)) {
        if (isNewUser && userType === 'student') {
          alert('Student registration requires @khi.iba.edu.pk email address');
        } else {
          alert('Please use @iba.edu.pk or @khi.iba.edu.pk email address');
        }
        setIsLoading(false);
        return;
      }

      if (isNewUser) {
        // REGISTRATION LOGIC
        if (userType === 'admin') {
          alert('Admin users cannot register. Please use predefined admin accounts.');
          setIsLoading(false);
          return;
        }

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
          alert('Passwords do not match!');
          setIsLoading(false);
          return;
        }

        // Validate ERP is a number
        if (!formData.studentId || isNaN(formData.studentId)) {
          alert('Please enter a valid Student ERP number');
          setIsLoading(false);
          return;
        }

        // Call registration API
        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            erp: parseInt(formData.studentId),
            name: formData.fullName,
            email: formData.email,
            password: formData.password,
            role: userType
          })
        });

        const result = await response.json();

        if (response.ok) {
          setShowOtp(true);
          console.log('Verification Code:', result.verificationCode); // For testing
          alert('✅ Verification code sent! Check browser console for code (in production, this would be emailed).');
        } else {
          alert(`❌ ${result.error || 'Registration failed'}`);
        }

      } else {
        // LOGIN LOGIC - Always use backend API
        // LOGIN LOGIC - Always use backend API
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          userType: userType
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Successful login - pass user data to parent
        console.log('Login successful, user data:', result.user); // Debug log
        
        if (onLogin) {
          onLogin(result.userType, result.role, result.user); // Pass user data
        }
      } else {
        alert(`❌ ${result.error || 'Login failed'}`);
      }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      alert('❌ Network error. Please check if backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async (otp) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          verificationCode: otp
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('Registration completed successfully! You can now login.');
        setShowOtp(false);
        setIsNewUser(false); // Switch to login mode
        // Clear form but keep email for login
        setFormData({
          email: formData.email,
          password: '',
          fullName: '',
          confirmPassword: '',
          studentId: ''
        });
      } else {
        alert(`❌ ${result.error || 'Invalid verification code'}`);
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      alert('❌ Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email
        })
      });

      const result = await response.json();

      if (response.ok) {
        console.log('New Verification Code:', result.verificationCode); // For testing
        alert('✅ New verification code sent! Check browser console for code.');
      } else {
        alert(`❌ ${result.error || 'Failed to resend code'}`);
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      alert('❌ Failed to resend code. Please try again.');
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handlePasswordReset = (email) => {
    // For now, just show a message
    alert(`📧 Password reset would be sent to ${email}\n\n(Feature not implemented yet)`);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setShowOtp(false);
  };

  // If Forgot Password screen should be shown
  if (showForgotPassword) {
    return (
      <ForgotPassword 
        onResetPassword={handlePasswordReset}
        onBackToLogin={handleBackToLogin}
      />
    );
  }

  // If OTP screen should be shown
  if (showOtp) {
    return (
      <OTPScreen 
        email={formData.email}
        onVerify={handleOtpVerify}
        onResendOtp={handleResendOtp}
        onBack={handleBackToLogin}
      />
    );
  }

  return (
    <div className="auth-form">
      <h2>IBA Room Booking System</h2>
      
      {/* User Type Selection - Only Student & Admin */}
      <UserTypeSelector 
        selectedType={userType}
        onTypeChange={handleUserTypeChange}
      />

      <form onSubmit={handleSubmit}>
        {/* Show additional fields for new users */}
        {isNewUser && (
          <>
            <div className="form-group">
              <input 
                type="text" 
                name="fullName"
                placeholder="Full Name" 
                value={formData.fullName}
                onChange={handleInputChange}
                required 
                disabled={isLoading}
              />
            </div>

            {/* Only show Student ID field for Student registration */}
            {userType === 'student' && (
              <div className="form-group">
                <input 
                  type="number" 
                  name="studentId"
                  placeholder="Student ERP Number" 
                  value={formData.studentId}
                  onChange={handleInputChange}
                  required 
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Admin cannot register */}
            {userType === 'admin' && (
              <div style={{ 
                padding: '10px', 
                background: '#fff3cd', 
                border: '1px solid #ffeaa7',
                borderRadius: '4px',
                fontSize: '14px',
                color: '#856404',
                marginBottom: '15px'
              }}>
                ⚠️ Admin users cannot register. Use predefined admin accounts.
              </div>
            )}
          </>
        )}

        {/* Common fields for both login and register */}
        <div className="form-group">
          <input 
            type="email" 
            name="email"
            placeholder={
              isNewUser && userType === 'student' 
                ? "Email (@khi.iba.edu.pk only)" 
                : "Email (@iba.edu.pk or @khi.iba.edu.pk)"
            } 
            value={formData.email}
            onChange={handleInputChange}
            required 
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <input 
            type="password" 
            name="password"
            placeholder="Password" 
            value={formData.password}
            onChange={handleInputChange}
            required 
            disabled={isLoading}
          />
        </div>

        {/* Confirm Password only for registration */}
        {isNewUser && userType === 'student' && (
          <div className="form-group">
            <input 
              type="password" 
              name="confirmPassword"
              placeholder="Confirm Password" 
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required 
              disabled={isLoading}
            />
          </div>
        )}

        {/* Forgot Password Link - Only show for login, not registration */}
        {!isNewUser && (
          <div className="forgot-password-link">
            <Button 
              type="button" 
              variant="text" 
              onClick={handleForgotPassword}
              style={{ fontSize: '14px', padding: '5px 0' }}
              disabled={isLoading}
            >
              Forgot Password?
            </Button>
          </div>
        )}

        <Button 
          type="submit" 
          variant="primary" 
          fullWidth 
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : (isNewUser ? 'Register & Send OTP' : 'Login')}
        </Button>
      </form>

      {/* Toggle between Login and Register */}
      <div className="auth-toggle">
        <p>
          {isNewUser ? 'Already have an account?' : "Don't have an account?"}
          <Button 
            type="button" 
            variant="text" 
            onClick={() => {
              if (!isLoading) {
                setIsNewUser(!isNewUser);
                // Clear form when switching modes
                setFormData({
                  email: '',
                  password: '',
                  fullName: '',
                  confirmPassword: '',
                  studentId: ''
                });
              }
            }}
            disabled={isLoading}
          >
            {isNewUser ? 'Login here' : 'Register here'}
          </Button>
        </p>
      </div>

      {/* Admin credentials reminder */}
      {!isNewUser && userType === 'admin' && (
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          background: '#f8f9fa', 
          borderRadius: '6px',
          fontSize: '12px',
          color: '#666',
          textAlign: 'left'
        }}>
          <strong>Admin Credentials:</strong><br/>
          • Program Office: programoffice@iba.edu.pk / IBAProgram2024<br/>
          • Building Incharge: buildingincharge@iba.edu.pk / IBABuilding2024
        </div>
      )}

      {/* Email domain reminder */}
      <div style={{ 
        marginTop: '10px', 
        padding: '8px', 
        background: '#e7f3ff', 
        borderRadius: '4px',
        fontSize: '11px',
        color: '#0066cc',
        textAlign: 'center'
      }}>
        {isNewUser && userType === 'student' 
          ? '📧 Student registration: @khi.iba.edu.pk only'
          : '📧 Login: @iba.edu.pk or @khi.iba.edu.pk'
        }
      </div>
    </div>
  );
};

export default LoginForm;