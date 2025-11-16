import React, { useState } from 'react';
import './App.css';
import LoginForm from './features/auth/components/LoginForm';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import StudentDashboard from './features/student/pages/StudentDashboard';
import backgroundImage from './assets/images/iba_background.jpeg';

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [userType, setUserType] = useState('student');
  const [userRole, setUserRole] = useState('');

  const handleLogin = (type, role = '') => {
    setUserType(type);
    setUserRole(role);
    setCurrentView(type);
  };

  const handleLogout = () => {
    setCurrentView('login');
    setUserRole('');
  };

  // Only show background image for login screen
  const appStyle = currentView === 'login' ? {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '100vh'
  } : {
    background: '#f8f9fa', // Solid background for dashboard views
    minHeight: '100vh'
  };

  return (
    <div className="App" style={appStyle}>
      {currentView === 'login' && (
        <LoginForm onLogin={handleLogin} onUserTypeChange={setUserType} />
      )}
      
      {currentView === 'admin' && (
        <AdminDashboard onLogout={handleLogout} userRole={userRole} />
      )}
      
      {currentView === 'student' && (
        <StudentDashboard onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;