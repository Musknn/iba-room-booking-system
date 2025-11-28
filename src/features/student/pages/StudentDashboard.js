// src/features/student/pages/StudentDashboard.js
import React, { useState } from 'react';
import './StudentDashboard.css';
import ViewAllRooms from '../components/ViewAllRooms';
import ClassroomBooking from '../components/ClassroomBooking';
import BreakoutBooking from '../components/BreakoutBooking';
import Announcements from '../components/Announcements';
import BookingHistory from '../components/BookingHistory';

const StudentDashboard = ({ onLogout, userData }) => {
  const [activeView, setActiveView] = useState('viewAllRooms');

  // Debug: Check what userData contains
  console.log('UserData in StudentDashboard:', userData);

  // Use actual user data from login with proper fallbacks
  const userInfo = userData ? {
    name: userData.name || 'Student',
    program: userData.program || 'Not Set', 
    intakeYear: userData.intakeYear || 'Not Set',
    erp: userData.erp || 'Not Set',
    email: userData.email || ''
  } : {
    name: 'Student',
    program: 'Not Set', 
    intakeYear: 'Not Set',
    erp: 'Not Set',
    email: ''
  };

  // Ensure ERP is properly formatted
  const displayERP = userInfo.erp && userInfo.erp !== 'Not Set' ? userInfo.erp : 'Not Set';
  const displayProgram = userInfo.program && userInfo.program !== 'Not Set' ? userInfo.program : 'Not Set';
  const displayIntakeYear = userInfo.intakeYear && userInfo.intakeYear !== 'Not Set' ? userInfo.intakeYear : 'Not Set';

  const navigationItems = [
    { id: 'viewAllRooms', label: 'View All Rooms' },
    { id: 'classroom', label: 'Classroom Booking' },
    { id: 'breakout', label: 'Breakout Room' },
    { id: 'announcements', label: 'Announcements' },
    { id: 'bookingHistory', label: 'Booking History' }
  ];

  const getHeaderInfo = () => {
    const info = {
      'viewAllRooms': { title: 'View All Rooms', subtitle: 'Browse and filter all available rooms' },
      'classroom': { title: 'Classroom Booking', subtitle: 'Reserve classrooms for academic purposes' },
      'breakout': { title: 'Breakout Room Booking', subtitle: 'Book breakout rooms for group discussions' },
      'announcements': { title: 'Announcements', subtitle: 'Latest university updates and notices' },
      'bookingHistory': { title: 'Booking History', subtitle: 'View and manage your reservations' }
    };
    return info[activeView] || { title: 'Student Dashboard', subtitle: 'Manage your room bookings' };
  };

  const renderMainContent = () => {
    // Pass the actual ERP number to booking components
    const studentERP = userInfo.erp && userInfo.erp !== 'Not Set' ? userInfo.erp : null;
    
    console.log('Passing ERP to components:', studentERP); // Debug log
    
    switch (activeView) {
      case 'viewAllRooms': return <ViewAllRooms studentERP={studentERP} />;
      case 'classroom': return <ClassroomBooking studentERP={studentERP} />;
      case 'breakout': return <BreakoutBooking studentERP={studentERP} />;
      case 'announcements': return <Announcements />;
      case 'bookingHistory': return <BookingHistory studentERP={studentERP} />;
      default: return <ViewAllRooms studentERP={studentERP} />;
    }
  };

  const headerInfo = getHeaderInfo();
  // Add this inside your StudentDashboard component, before the return statement
console.log('=== DEBUG INFO ===');
console.log('userData prop:', userData);
console.log('userInfo object:', userInfo);
console.log('ERP value:', userInfo.erp);
console.log('ERP type:', typeof userInfo.erp);
console.log('==================');
  return (
    <div className="student-dashboard">
      {/* Left Sidebar - Navigation */}
      <aside className="navigation-sidebar">
        {/* User Info Section */}
        <div className="user-info-section">
          <div className="profile-circle">
            <span className="profile-initial">{userInfo.name.charAt(0)}</span>
          </div>
          <h3 className="user-name">{userInfo.name}</h3>
          <p className="user-program">{displayProgram} • {displayIntakeYear}</p>
          <p className="user-erp">ERP: {displayERP}</p>
        </div>

        {/* Navigation Tabs */}
        <nav className="navigation-tabs">
          {navigationItems.map(item => (
            <button
              key={item.id}
              className={`nav-tab ${activeView === item.id ? 'active' : ''}`}
              onClick={() => setActiveView(item.id)}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout Section */}
        <div className="logout-section">
          <button onClick={onLogout} className="sidebar-logout-btn">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <h1 className="header-title">{headerInfo.title}</h1>
          <p className="header-subtitle">{headerInfo.subtitle}</p>
        </header>

        {/* Content Area */}
        <div className="content-area-full">
          <div className="content-panel-full">
            {renderMainContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;