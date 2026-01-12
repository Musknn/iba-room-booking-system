// src/features/auth/components/OTPScreen.js  // File path indicating OTP verification screen component

import React, { useState } from 'react'; // Import React and useState hook for state management
import Button from '../../../shared/components/ui/Button'; // Import reusable Button UI component

// Define OTPScreen functional component and destructure props
const OTPScreen = ({ email, onVerify, onResendOtp, onBack }) => {

  // State to store OTP digits as an array of 6 individual characters
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  // Function to handle change in any OTP input field
  const handleOtpChange = (index, value) => {

    // Allow only a single numeric digit (0–9) or empty value
    if (/^\d?$/.test(value)) {

      // Create a shallow copy of the existing OTP array
      const newOtp = [...otp];

      // Update the OTP digit at the given index
      newOtp[index] = value;

      // Update OTP state with the new array
      setOtp(newOtp);
      
      // Auto-focus next input  // Comment retained and expanded
      // If a digit is entered and it's not the last input
      if (value && index < 5) {

        // Move focus to the next OTP input field if it exists
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  // Function to handle OTP form submission
  const handleSubmit = (e) => {

    // Prevent default form submission behavior
    e.preventDefault();

    // Combine OTP digits array into a single string
    const otpString = otp.join('');

    // Call onVerify callback if it exists and pass OTP string
    onVerify?.(otpString);
  };

  // JSX returned by the OTPScreen component
  return (

    // Wrapper div for OTP screen
    <div className="otp-screen">

      // Heading for OTP verification
      <h2>Verify Your Email</h2>

      // Inform user where the OTP was sent
      <p>We sent a verification code to {email}</p>
      
      // OTP form container
      <form onSubmit={handleSubmit}>

        // Wrapper for OTP input fields
        <div className="otp-inputs">

          // Map over OTP array to generate 6 input fields
          {otp.map((digit, index) => (

            // Individual OTP input field
            <input
              key={index} // Unique key for React list rendering
              id={`otp-${index}`} // Assign unique ID for focus control
              type="text" // Input type set to text
              maxLength="1" // Limit input to one character
              value={digit} // Bind input value to OTP state
              onChange={(e) => handleOtpChange(index, e.target.value)} // Handle input change
              className="otp-digit" // CSS class for styling OTP inputs
            />
          ))}
        </div>
        
        // Submit button for OTP verification
        <Button type="submit" variant="primary" fullWidth>
          Verify OTP
        </Button>
        
        // Container for secondary OTP actions
        <div className="otp-actions" style={{ marginTop: '20px', textAlign: 'center' }}>

          // Button to resend OTP
          <Button type="button" variant="text" onClick={onResendOtp}>
            Resend OTP
          </Button>

          // Button to navigate back to login screen
          <Button
            type="button" // Button does not submit form
            variant="text" // Text-style button
            onClick={onBack} // Trigger back navigation
            style={{ marginLeft: '10px' }} // Inline spacing between buttons
          >
            Back to Login
          </Button>

        </div>
      </form>
    </div>
  );
};

// Export OTPScreen component for use in other parts of the application
export default OTPScreen;
