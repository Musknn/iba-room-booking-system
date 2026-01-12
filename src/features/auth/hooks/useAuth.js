import { useState } from 'react'; // Import useState hook from React for managing component state

// Custom authentication hook
export const useAuth = () => {

  // State to store selected user type (student/admin)
  const [userType, setUserType] = useState('student');

  // State to track whether the user is registering or logging in
  const [isNewUser, setIsNewUser] = useState(false);

  // State to control visibility of OTP verification screen
  const [showOtp, setShowOtp] = useState(false);

  // Function to toggle between login and registration modes
  const toggleUserType = () => {

    // Flip the current isNewUser state value
    setIsNewUser(!isNewUser);
  };

  // Main authentication handler for login or registration
  const handleAuthentication = (formData) => {

    // Check if user is registering
    if (isNewUser) {

      // Registration logic
      setShowOtp(true); // Show OTP verification screen after registration attempt

    } else {

      // Login logic
      console.log('Login attempt:', formData); // Log login form data to console
    }
  };

  // Function to handle OTP verification
  const handleOtpVerify = (otp) => {

    // Verify OTP
    setShowOtp(false); // Hide OTP screen after verification

    // Redirect or show success
  };

  // Return state values and handlers for use in components
  return {
    userType, // Current selected user type
    setUserType, // Setter function for user type
    isNewUser, // Boolean indicating login or registration mode
    toggleUserType, // Function to toggle login/register
    showOtp, // Boolean controlling OTP screen visibility
    setShowOtp, // Setter function for OTP screen visibility
    handleAuthentication, // Function to handle authentication flow
    handleOtpVerify // Function to handle OTP verification
  };
};
