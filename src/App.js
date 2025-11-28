// src/App.js
import React, { useState } from 'react';
import './App.css';
import LoginForm from './features/auth/components/LoginForm';
import StudentDashboard from './features/student/pages/StudentDashboard';
import AdminDashboard from './features/admin/pages/AdminDashboard';

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [userType, setUserType] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null); // Add this line

  const handleLogin = (type, role = null, user = null) => { // Update this function
    setUserType(type);
    setUserRole(role);
    setUserData(user); // Store user data
    
    console.log('Login successful - User data:', user); // Debug log
    
    if (type === 'student') {
      setCurrentView('student-dashboard');
    } else if (type === 'admin') {
      setCurrentView('admin-dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentView('login');
    setUserType(null);
    setUserRole(null);
    setUserData(null); // Clear user data on logout
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return (
          <div className="login-background">
            <div className="login-center-container">
              <LoginForm onLogin={handleLogin} />
            </div>
          </div>
        );
      case 'student-dashboard':
        return <StudentDashboard onLogout={handleLogout} userData={userData} />;
      case 'admin-dashboard':
        return <AdminDashboard onLogout={handleLogout} userRole={userRole} userData={userData} />;
      default:
        return (
          <div className="login-background">
            <div className="login-center-container">
              <LoginForm onLogin={handleLogin} />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="App">
      {renderCurrentView()}
    </div>
  );
}

export default App;