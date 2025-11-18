import React, { useState } from 'react';
import Button from '../../../shared/components/ui/Button';

const ForgotPassword = ({ onResetPassword, onBackToLogin }) => {
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter code, 3: New password
  const [formData, setFormData] = useState({
    email: '',
    resetCode: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSendCode = (e) => {
    e.preventDefault();
    if (formData.email) {
      // Simulate sending reset code
      onResetPassword(formData.email);
      setStep(2);
    }
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();
    if (formData.resetCode) {
      // In real app, verify the code with backend
      setStep(3);
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (formData.newPassword === formData.confirmPassword) {
      // In real app, send new password to backend
      alert('✅ Password reset successfully! You can now login with your new password.');
      onBackToLogin();
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
            <p>Enter your IBA email address to receive a reset code</p>
            
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
                  Send Reset Code
                </Button>
              </div>
            </form>
          </div>
        );

      case 2:
        return (
          <div>
            <h2>Enter Reset Code</h2>
            <p>We sent a 6-digit code to {formData.email}</p>
            
            <form onSubmit={handleVerifyCode}>
              <div className="form-group">
                <input 
                  type="text" 
                  name="resetCode"
                  placeholder="Enter 6-digit code" 
                  value={formData.resetCode}
                  onChange={handleInputChange}
                  maxLength="6"
                  required 
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <Button type="button" variant="text" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="submit" variant="primary">
                  Verify Code
                </Button>
              </div>
            </form>
          </div>
        );

      case 3:
        return (
          <div>
            <h2>Create New Password</h2>
            <p>Enter your new password</p>
            
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <input 
                  type="password" 
                  name="newPassword"
                  placeholder="New Password" 
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
                <Button type="button" variant="text" onClick={() => setStep(2)}>
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