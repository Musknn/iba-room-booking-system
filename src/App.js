import React, { useState } from 'react';
import './App.css';
import LoginForm from './features/auth/components/LoginForm';
import StudentDashboard from './features/student/pages/StudentDashboard';
import AdminDashboard from './features/admin/pages/AdminDashboard';

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [userType, setUserType] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const handleLogin = (type, role = null) => {
    setUserType(type);
    setUserRole(role);
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
        return <StudentDashboard onLogout={handleLogout} />;
      case 'admin-dashboard':
        return <AdminDashboard onLogout={handleLogout} userRole={userRole} />;
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