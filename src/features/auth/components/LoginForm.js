import React, { useState } from 'react';
import Button from '../../../shared/components/ui/Button';
import UserTypeSelector from './UserTypeSelector';
import ForgotPassword from './ForgotPassword';

const LoginForm = ({ onLogin, onUserTypeChange }) => {
  const [isNewUser, setIsNewUser] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [userType, setUserType] = useState('student');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    fullName: '',
    confirmPassword: '',
    studentId: '',
    phoneNumber: '',
    program: '',
    intakeYear: ''
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

  const validateIdentifier = (identifier) => {
    if (identifier.includes('@')) {
      if (userType === 'student') {
        return identifier.endsWith('@khi.iba.edu.pk');
      } else if (userType === 'admin') {
        return identifier.endsWith('@iba.edu.pk');
      } else {
        return false;
      }
    } else {
      // Phone number
      const phoneRegex = /^03\d{9}$/;
      return phoneRegex.test(identifier);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate identifier
      if (!validateIdentifier(formData.identifier)) {
        if (isNewUser && userType === 'student') {
          alert('Student registration requires @khi.iba.edu.pk email address');
        } else {
          alert('For login: Please use @iba.edu.pk, @khi.iba.edu.pk email OR phone number');
        }
        setIsLoading(false);
        return;
      }

      if (isNewUser) {
        // REGISTRATION LOGIC (DIRECT - NO OTP)
        if (userType === 'admin') {
          alert('Admin users cannot register. Please use predefined admin accounts.');
          setIsLoading(false);
          return;
        }

        // Validate all required fields for registration
        if (!formData.fullName || !formData.studentId || !formData.identifier || 
            !formData.password || !formData.confirmPassword || !formData.phoneNumber ||
            !formData.program || !formData.intakeYear) {
          alert('All fields are required for registration');
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

        // Validate phone number
        const phoneRegex = /^03\d{9}$/;
        if (!phoneRegex.test(formData.phoneNumber)) {
          alert('Please enter a valid Pakistani phone number (03XXXXXXXXX)');
          setIsLoading(false);
          return;
        }

        // Call registration API (direct registration - no OTP)
        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            erp: parseInt(formData.studentId),
            name: formData.fullName,
            email: formData.identifier,
            password: formData.password,
            phoneNumber: formData.phoneNumber,
            program: formData.program,
            intakeYear: parseInt(formData.intakeYear)
          })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          alert('✅ Registration successful! You can now login.');
          setIsNewUser(false); // Switch to login mode
          // Clear form but keep identifier for login
          setFormData({
            identifier: formData.identifier,
            password: '',
            fullName: '',
            confirmPassword: '',
            studentId: '',
            phoneNumber: '',
            program: '',
            intakeYear: ''
          });
        } else {
          alert(`${result.error || 'Registration failed'}`);
        }

      } else {
        // LOGIN LOGIC
        console.log("Sending login request:", {
          identifier: formData.identifier,
          userType: userType
        });

        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.identifier,
            password: formData.password,
            userType: userType
          })
        });

        const result = await response.json();
        console.log("LOGIN RESPONSE:", result);

        if (response.ok && result.success) {
          const role = result.role;
          const type = result.userType;
          const backendUser = result.user;

          // STORE USER PROPERLY
          let userToStore = null;

          if (role === "BuildingIncharge") {
            userToStore = {
              Incharge_ID: backendUser.INCHARGE_ID,
              name: backendUser.NAME,
              email: backendUser.EMAIL,
              role: "BI"
            };
          }
          else if (role === "ProgramOffice") {
            userToStore = {
              ProgramOffice_ID: backendUser.PROGRAM_OFFICE_ID,
              name: backendUser.NAME,
              email: backendUser.EMAIL,
              role: "PO"
            };
          }
          else {
            // student user
            userToStore = backendUser;
          }

          // Store ERP in localStorage correctly
          if (role === "BuildingIncharge") {
            localStorage.setItem("erp", backendUser.INCHARGE_ID);
          } 
          else if (role === "ProgramOffice") {
            localStorage.setItem("erp", backendUser.PROGRAM_OFFICE_ID);
          } 
          else {
            localStorage.setItem("erp", backendUser.erp);
          }

          localStorage.setItem("user", JSON.stringify(userToStore));
          
          console.log("SAVED USER =", userToStore);
          console.log("SAVED ERP =", backendUser.erp || backendUser.INCHARGE_ID || backendUser.PROGRAM_OFFICE_ID);

          // call parent
          if (onLogin) {
            onLogin(type, role, backendUser);
          }

        } else {
          alert(`${result.error || 'Login failed'}`);
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      alert('Network error. Please check if backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handlePasswordReset = async (email, newPassword) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          newPassword: newPassword
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        alert('Password reset successful! You can now login with your new password.');
        return true;
      } else {
        alert(`${result.error || 'Password reset failed'}`);
        return false;
      }
    } catch (error) {
      console.error('Password reset error:', error);
      alert('Network error. Please try again.');
      return false;
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
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

            {/* Student ID field for Student registration */}
            {userType === 'student' && (
              <>
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

                <div className="form-group">
                  <input 
                    type="text" 
                    name="phoneNumber"
                    placeholder="Phone Number (03XXXXXXXXX)" 
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required 
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <select 
                    name="program"
                    value={formData.program}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                    className="form-select"
                  >
                    <option value="">Select Program</option>
                    <option value="BBA">BBA</option>
                    <option value="BSACF">BSACF</option>
                    <option value="BSECO">BSECO</option>
                    <option value="BSBA">BSBA</option>
                    <option value="BSSS">BSSS</option>
                    <option value="BSCS">BSCS</option>
                    <option value="BSEM">BSEM</option>
                    <option value="BSMT">BSMT</option>
                  </select>
                </div>

                <div className="form-group">
                  <input 
                    type="number" 
                    name="intakeYear"
                    placeholder="Intake Year (e.g., 2024)" 
                    value={formData.intakeYear}
                    onChange={handleInputChange}
                    required 
                    disabled={isLoading}
                    min="2000"
                    max="2030"
                  />
                </div>
              </>
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
                 Admin users cannot register. Use predefined admin accounts.
              </div>
            )}
          </>
        )}

        {/* Common fields for both login and register */}
        <div className="form-group">
          <input 
            type="text"
            name="identifier"
            placeholder={
              isNewUser && userType === 'student' 
                ? "Email (@khi.iba.edu.pk only)" 
                : "Email (@iba.edu.pk or @khi.iba.edu.pk) OR Phone"
            } 
            value={formData.identifier}
            onChange={handleInputChange}
            required 
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <input 
            type="password" 
            name="password"
            placeholder="Password (8-16 characters)" 
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
          {isLoading ? 'Processing...' : (isNewUser ? 'Register' : 'Login')}
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
                  identifier: '',
                  password: '',
                  fullName: '',
                  confirmPassword: '',
                  studentId: '',
                  phoneNumber: '',
                  program: '',
                  intakeYear: ''
                });
              }
            }}
            disabled={isLoading}
          >
            {isNewUser ? 'Login here' : 'Register here'}
          </Button>
        </p>
      </div>

      {/* Email/Phone reminder */}
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
          ? 'Student registration: @khi.iba.edu.pk only'
          : 'Login: @iba.edu.pk or @khi.iba.edu.pk OR Phone number'
        }
      </div>
    </div>
  );
};

export default LoginForm;