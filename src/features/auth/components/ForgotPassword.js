import React, { useState } from 'react';
import Button from '../../../shared/components/ui/Button';

const ForgotPassword = ({ onResetPassword, onBackToLogin }) => {
  const [step, setStep] = useState(1); // 1: Enter email, 2: New password
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (formData.email) {
      // Directly move to password reset step (no OTP verification)
      setStep(2);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword === formData.confirmPassword) {
      // Call the password reset API
      const success = await onResetPassword(formData.email, formData.newPassword);
      if (success) {
        onBackToLogin();
      }
    } else {
      alert('❌ Passwords do not match!');
    }
  };

  const getStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2>Reset Your Password</h2>
            <p>Enter your IBA email address to reset your password</p>
            
            <form onSubmit={handleSendCode}>
              <div className="form-group">
                <input 
                  type="email" 
                  name="email"
                  placeholder="Enter your IBA email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <Button type="button" variant="text" onClick={onBackToLogin}>
                  Back to Login
                </Button>
                <Button type="submit" variant="primary">
                  Continue
                </Button>
              </div>
            </form>
          </div>
        );

      case 2:
        return (
          <div>
            <h2>Create New Password</h2>
            <p>Enter your new password for {formData.email}</p>
            
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <input 
                  type="password" 
                  name="newPassword"
                  placeholder="New Password (8-16 characters)" 
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              
              <div className="form-group">
                <input 
                  type="password" 
                  name="confirmPassword"
                  placeholder="Confirm New Password" 
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <Button type="button" variant="text" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="submit" variant="primary">
                  Reset Password
                </Button>
              </div>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="auth-form">
      {getStepContent()}
    </div>
  );
};

export default ForgotPassword;