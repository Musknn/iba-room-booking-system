import React from 'react';
import ProgramOffice from '../components/ProgramOffice';
import BuildingIncharge from '../components/BuildingIncharge';

const AdminDashboard = ({ onLogout, userRole }) => {
  // If no specific role is set (legacy login)
  if (!userRole) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '40px', 
          borderRadius: '15px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#800000', marginBottom: '20px' }}>Authentication Required</h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            Please login with specific admin credentials.
          </p>
          <button 
            onClick={onLogout}
            style={{
              background: '#800000',
              color: 'white',
              padding: '12px 30px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // Render the appropriate dashboard based on role
  const renderDashboard = () => {
    switch (userRole) {
      case 'ProgramOffice':
        return <ProgramOffice onLogout={onLogout} userRole={userRole} />;
      case 'BuildingIncharge':
        return <BuildingIncharge onLogout={onLogout} userRole={userRole} />;
      default:
        return (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2>Invalid Role: {userRole}</h2>
            <button onClick={onLogout}>Return to Login</button>
          </div>
        );
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {renderDashboard()}
    </div>
  );
};

export default AdminDashboard;