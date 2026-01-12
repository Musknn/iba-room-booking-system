// Import React library and useState hook
import React, { useState } from 'react';

// Import reusable Button component
import Button from '../../../shared/components/ui/Button';

// Import user type selector component
import UserTypeSelector from './UserTypeSelector';

// Import forgot password component
import ForgotPassword from './ForgotPassword';

// Define LoginForm component and receive props
const LoginForm = ({ onLogin, onUserTypeChange }) => {

  // State to track whether user is registering or logging in
  const [isNewUser, setIsNewUser] = useState(false);

  // State to control forgot password screen visibility
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // State to track selected user type (student/admin)
  const [userType, setUserType] = useState('student');

  // State to track loading status during API calls
  const [isLoading, setIsLoading] = useState(false);

  // State object to store all form input values
  const [formData, setFormData] = useState({

    // Store email or phone identifier
    identifier: '',

    // Store password
    password: '',

    // Store full name for registration
    fullName: '',

    // Store confirm password
    confirmPassword: '',

    // Store student ERP ID
    studentId: '',

    // Store phone number
    phoneNumber: '',

    // Store academic program
    program: '',

    // Store intake year
    intakeYear: ''
  });

  // Handle changes for all input fields
  const handleInputChange = (e) => {

    // Update form data state
    setFormData({

      // Keep existing form data
      ...formData,

      // Update the specific field using input name
      [e.target.name]: e.target.value
    });
  };

  // Handle change of user type
  const handleUserTypeChange = (type) => {

    // Update user type state
    setUserType(type);

    // Notify parent component if handler exists
    if (onUserTypeChange) {
      onUserTypeChange(type);
    }
  };

  // Validate identifier based on email or phone number rules
  const validateIdentifier = (identifier) => {

    // Check if identifier contains '@' (email)
    if (identifier.includes('@')) {

      // Student email validation
      if (userType === 'student') {
        return identifier.endsWith('@khi.iba.edu.pk');

      // Admin email validation
      } else if (userType === 'admin') {
        return identifier.endsWith('@iba.edu.pk');

      // Invalid user type
      } else {
        return false;
      }

    } else {

      // Phone number validation
      const phoneRegex = /^03\d{9}$/;
      return phoneRegex.test(identifier);
    }
  };

  // Handle form submission for login or registration
  const handleSubmit = async (e) => {

    // Prevent default form submission
    e.preventDefault();

    // Enable loading state
    setIsLoading(true);

    try {

      // Validate identifier
      if (!validateIdentifier(formData.identifier)) {

        // Student registration email restriction
        if (isNewUser && userType === 'student') {
          alert('Student registration requires @khi.iba.edu.pk email address');

        // General login validation error
        } else {
          alert('For login: Please use @iba.edu.pk, @khi.iba.edu.pk email OR phone number');
        }

        // Disable loading
        setIsLoading(false);

        // Exit function
        return;
      }

      // If user is registering
      if (isNewUser) {

        // Admin registration is not allowed
        if (userType === 'admin') {
          alert('Admin users cannot register. Please use predefined admin accounts.');
          setIsLoading(false);
          return;
        }

        // Validate required registration fields
        if (!formData.fullName || !formData.studentId || !formData.identifier || 
            !formData.password || !formData.confirmPassword || !formData.phoneNumber ||
            !formData.program || !formData.intakeYear) {
          alert('All fields are required for registration');
          setIsLoading(false);
          return;
        }

        // Validate password match
        if (formData.password !== formData.confirmPassword) {
          alert('Passwords do not match!');
          setIsLoading(false);
          return;
        }

        // Validate ERP is numeric
        if (!formData.studentId || isNaN(formData.studentId)) {
          alert('Please enter a valid Student ERP number');
          setIsLoading(false);
          return;
        }

        // Validate Pakistani phone number
        const phoneRegex = /^03\d{9}$/;
        if (!phoneRegex.test(formData.phoneNumber)) {
          alert('Please enter a valid Pakistani phone number (03XXXXXXXXX)');
          setIsLoading(false);
          return;
        }

        // Send registration request to backend
        const response = await fetch('http://localhost:5000/api/auth/register', {

          // HTTP method
          method: 'POST',

          // Request headers
          headers: {
            'Content-Type': 'application/json',
          },

          // Request body payload
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

        // Parse JSON response
        const result = await response.json();

        // If registration is successful
        if (response.ok && result.success) {

          // Show success message
          alert('✅ Registration successful! You can now login.');

          // Switch back to login mode
          setIsNewUser(false);

          // Reset form except identifier
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

          // Show registration error
          alert(`${result.error || 'Registration failed'}`);
        }

      } else {

        // LOGIN LOGIC
        console.log("Sending login request:", {
          identifier: formData.identifier,
          userType: userType
        });

        // Send login request
        const response = await fetch('http://localhost:5000/api/auth/login', {

          // HTTP method
          method: 'POST',

          // Request headers
          headers: {
            'Content-Type': 'application/json',
          },

          // Request body
          body: JSON.stringify({
            email: formData.identifier,
            password: formData.password,
            userType: userType
          })
        });

        // Parse response
        const result = await response.json();

        // Log login response
        console.log("LOGIN RESPONSE:", result);

        // If login successful
        if (response.ok && result.success) {

          // Extract role
          const role = result.role;

          // Extract user type
          const type = result.userType;

          // Extract backend user object
          const backendUser = result.user;

          // Initialize user storage object
          let userToStore = null;

          // Building Incharge user mapping
          if (role === "BuildingIncharge") {
            userToStore = {
              Incharge_ID: backendUser.INCHARGE_ID,
              name: backendUser.NAME,
              email: backendUser.EMAIL,
              role: "BI"
            };
          }

          // Program Office user mapping
          else if (role === "ProgramOffice") {
            userToStore = {
              ProgramOffice_ID: backendUser.PROGRAM_OFFICE_ID,
              name: backendUser.NAME,
              email: backendUser.EMAIL,
              role: "PO"
            };
          }

          // Student user mapping
          else {
            userToStore = backendUser;
          }

          // Store ERP based on role
          if (role === "BuildingIncharge") {
            localStorage.setItem("erp", backendUser.INCHARGE_ID);
          } 
          else if (role === "ProgramOffice") {
            localStorage.setItem("erp", backendUser.PROGRAM_OFFICE_ID);
          } 
          else {
            localStorage.setItem("erp", backendUser.erp);
          }

          // Store user object in localStorage
          localStorage.setItem("user", JSON.stringify(userToStore));
          
          // Debug logs
          console.log("SAVED USER =", userToStore);
          console.log("SAVED ERP =", backendUser.erp || backendUser.INCHARGE_ID || backendUser.PROGRAM_OFFICE_ID);

          // Call parent login handler
          if (onLogin) {
            onLogin(type, role, backendUser);
          }

        } else {

          // Show login failure
          alert(`${result.error || 'Login failed'}`);
        }
      }

    } catch (error) {

      // Log authentication error
      console.error('Authentication error:', error);

      // Show network error message
      alert('Network error. Please check if backend is running.');

    } finally {

      // Disable loading state
      setIsLoading(false);
    }
  };

  // Show forgot password screen
  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  // Handle password reset request
  const handlePasswordReset = async (email, newPassword) => {

    try {

      // Send reset password request
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {

        // HTTP method
        method: 'POST',

        // Request headers
        headers: {
          'Content-Type': 'application/json',
        },

        // Request body
        body: JSON.stringify({
          email: email,
          newPassword: newPassword
        })
      });

      // Parse response
      const result = await response.json();
      
      // If password reset successful
      if (response.ok && result.success) {
        alert('Password reset successful! You can now login with your new password.');
        return true;

      } else {
        alert(`${result.error || 'Password reset failed'}`);
        return false;
      }

    } catch (error) {

      // Log reset error
      console.error('Password reset error:', error);

      // Show network error
      alert('Network error. Please try again.');
      return false;
    }
  };

  // Return to login screen from forgot password
  const handleBackToLogin = () => {
    setShowForgotPassword(false);
  };

  // If forgot password screen is active
  if (showForgotPassword) {
    return (
      <ForgotPassword 
        onResetPassword={handlePasswordReset}
        onBackToLogin={handleBackToLogin}
      />
    );
  }

  // Render login / registration form
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
