// Import React library and useState hook
import React, { useState } from 'react';

// Import reusable Button UI component
import Button from '../../../shared/components/ui/Button';

// Define ForgotPassword functional component and receive props
const ForgotPassword = ({ onResetPassword, onBackToLogin }) => {

  // State to track current step (1 = email entry, 2 = password reset)
  const [step, setStep] = useState(1); // 1: Enter email, 2: New password

  // State to store form input values
  const [formData, setFormData] = useState({

    // Store user's email address
    email: '',

    // Store new password
    newPassword: '',

    // Store confirmation password
    confirmPassword: ''
  });

  // Handle input field changes
  const handleInputChange = (e) => {

    // Update formData state
    setFormData({

      // Keep existing form data
      ...formData,

      // Update specific field based on input name
      [e.target.name]: e.target.value
    });
  };

  // Handle submission of email form
  const handleSendCode = async (e) => {

    // Prevent default form submission behavior
    e.preventDefault();

    // Check if email field is not empty
    if (formData.email) {

      // Directly move to password reset step (no OTP verification)
      setStep(2);
    }
  };

  // Handle submission of password reset form
  const handleResetPassword = async (e) => {

    // Prevent default form submission behavior
    e.preventDefault();

    // Check if new password and confirm password match
    if (formData.newPassword === formData.confirmPassword) {

      // Call password reset function passed as prop
      const success = await onResetPassword(formData.email, formData.newPassword);

      // If password reset is successful
      if (success) {

        // Navigate back to login page
        onBackToLogin();
      }

    } else {

      // Show alert if passwords do not match
      alert('❌ Passwords do not match!');
    }
  };

  // Function to render UI based on current step
  const getStepContent = () => {

    // Switch based on step number
    switch (step) {

      // Step 1: Email input screen
      case 1:
        return (

          // Wrapper div for step 1 content
          <div>

            {/* Heading for reset password */}
            <h2>Reset Your Password</h2>

            {/* Instruction text */}
            <p>Enter your IBA email address to reset your password</p>
            
            {/* Form for email submission */}
            <form onSubmit={handleSendCode}>

              {/* Form group for email input */}
              <div className="form-group">

                {/* Email input field */}
                <input 
                  type="email" // Specify email input type
                  name="email" // Name attribute for state mapping
                  placeholder="Enter your IBA email" // Placeholder text
                  value={formData.email} // Bind input value to state
                  onChange={handleInputChange} // Handle input changes
                  required // Make field mandatory
                />
              </div>
              
              {/* Button container */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>

                {/* Button to return to login page */}
                <Button type="button" variant="text" onClick={onBackToLogin}>
                  Back to Login
                </Button>

                {/* Button to continue to next step */}
                <Button type="submit" variant="primary">
                  Continue
                </Button>

              </div>
            </form>
          </div>
        );

      // Step 2: New password screen
      case 2:
        return (

          // Wrapper div for step 2 content
          <div>

            {/* Heading for new password */}
            <h2>Create New Password</h2>

            {/* Show email being reset */}
            <p>Enter your new password for {formData.email}</p>
            
            {/* Form for resetting password */}
            <form onSubmit={handleResetPassword}>

              {/* Form group for new password */}
              <div className="form-group">

                {/* New password input */}
                <input 
                  type="password" // Specify password input type
                  name="newPassword" // Name attribute for state mapping
                  placeholder="New Password (8-16 characters)" // Placeholder text
                  value={formData.newPassword} // Bind value to state
                  onChange={handleInputChange} // Handle input changes
                  required // Make field mandatory
                />
              </div>
              
              {/* Form group for confirm password */}
              <div className="form-group">

                {/* Confirm password input */}
                <input 
                  type="password" // Specify password input type
                  name="confirmPassword" // Name attribute for state mapping
                  placeholder="Confirm New Password" // Placeholder text
                  value={formData.confirmPassword} // Bind value to state
                  onChange={handleInputChange} // Handle input changes
                  required // Make field mandatory
                />
              </div>
              
              {/* Button container */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>

                {/* Button to go back to step 1 */}
                <Button type="button" variant="text" onClick={() => setStep(1)}>
                  Back
                </Button>

                {/* Button to submit password reset */}
                <Button type="submit" variant="primary">
                  Reset Password
                </Button>

              </div>
            </form>
          </div>
        );

      // Default case if step value is invalid
      default:
        return null;
    }
  };

  // Return JSX for Forgot Password page
  return (

    // Wrapper for authentication form layout
    <div className="auth-form">

      {/* Render content based on current step */}
      {getStepContent()}

    </div>
  );
};

// Export ForgotPassword component for use in other files
export default ForgotPassword;
