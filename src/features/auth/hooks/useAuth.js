import { useState } from 'react';

export const useAuth = () => {
  const [userType, setUserType] = useState('student');
  const [isNewUser, setIsNewUser] = useState(false);
  const [showOtp, setShowOtp] = useState(false);

  const toggleUserType = () => {
    setIsNewUser(!isNewUser);
  };

  const handleAuthentication = (formData) => {
    if (isNewUser) {
      // Registration logic
      setShowOtp(true);
    } else {
      // Login logic
      console.log('Login attempt:', formData);
    }
  };

  const handleOtpVerify = (otp) => {
    // Verify OTP
    setShowOtp(false);
    // Redirect or show success
  };

  return {
    userType,
    setUserType,
    isNewUser,
    toggleUserType,
    showOtp,
    setShowOtp,
    handleAuthentication,
    handleOtpVerify
  };
};