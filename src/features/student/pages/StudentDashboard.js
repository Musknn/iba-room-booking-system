// ===============================
// StudentDashboard.js
// ===============================

// Import React and necessary hooks
import React, { useState } from 'react';
import './StudentDashboard.css'; // Styles specific to this dashboard

// Import all feature components used in dashboard
import ViewAllRooms from '../components/ViewAllRooms';
import ClassroomBooking from '../components/ClassroomBooking';
import BreakoutBooking from '../components/BreakoutBooking';
import Announcements from '../components/Announcements';
import BookingHistory from '../components/BookingHistory';
import Notifications from '../components/Notifications';

// ===============================
// MAIN COMPONENT
// ===============================
const StudentDashboard = ({ onLogout, userData }) => {
  
  // -------------------------------
  // STATE: currently active view/tab
  // -------------------------------
  const [activeView, setActiveView] = useState('viewAllRooms');

  console.log('UserData in StudentDashboard:', userData);

  // -------------------------------
  // PARSE USER INFO WITH DEFAULTS
  // -------------------------------
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

  const displayERP = userInfo.erp && userInfo.erp !== 'Not Set' ? userInfo.erp : 'Not Set';
  const displayProgram = userInfo.program || 'Not Set';
  const displayIntakeYear = userInfo.intakeYear || 'Not Set';

  // -------------------------------
  // NAVIGATION TABS
  // -------------------------------
  // Simple text-based tabs for switching views
  const navigationItems = [
    { id: 'viewAllRooms', label: 'View All Rooms' },
    { id: 'classroom', label: 'Classroom Booking' },
    { id: 'breakout', label: 'Breakout Room' },
    { id: 'announcements', label: 'Announcements' },   // Text tab only
    { id: 'notifications', label: 'Notifications' },
    { id: 'bookingHistory', label: 'Booking History' }
  ];

  // -------------------------------
  // GET HEADER INFO BASED ON ACTIVE VIEW
  // -------------------------------
  const getHeaderInfo = () => {
    const info = {
      'viewAllRooms': { title: 'View All Rooms', subtitle: 'Browse and filter all available rooms' },
      'classroom': { title: 'Classroom Booking', subtitle: 'Reserve classrooms for academic purposes' },
      'breakout': { title: 'Breakout Room Booking', subtitle: 'Book breakout rooms for group discussions' },
      'announcements': { title: 'Announcements', subtitle: 'Latest university updates and notices' },
      'notifications': { title: 'Notifications', subtitle: 'Your latest activity updates' },
      'bookingHistory': { title: 'Booking History', subtitle: 'View and manage your reservations' }
    };
    return info[activeView] || { title: 'Student Dashboard', subtitle: 'Manage your room bookings' };
  };

  // -------------------------------
  // RENDER MAIN CONTENT BASED ON ACTIVE VIEW
  // -------------------------------
  const renderMainContent = () => {
    // ERP is optional in some components
    const studentERP = userInfo.erp !== 'Not Set' ? userInfo.erp : null;

    switch (activeView) {
      case 'viewAllRooms': return <ViewAllRooms studentERP={studentERP} />;
      case 'classroom': return <ClassroomBooking studentERP={studentERP} />;
      case 'breakout': return <BreakoutBooking studentERP={studentERP} />;
      case 'announcements': return <Announcements />;
      case 'notifications': return <Notifications studentERP={studentERP} />;
      case 'bookingHistory': return <BookingHistory studentERP={studentERP} />;
      default: return <ViewAllRooms studentERP={studentERP} />;
    }
  };

  const headerInfo = getHeaderInfo(); // Get current header title/subtitle

  // ===============================
  // JSX STRUCTURE
  // ===============================
  return (
    <div className="student-dashboard">

      {/* ==========================
          SIDEBAR
          ========================== */}
      <aside className="navigation-sidebar">

        {/* --------------------------
            USER INFO SECTION
            -------------------------- */}
        <div className="user-info-section">
          {/* Profile circle showing first initial */}
          <div className="profile-circle">
            <span className="profile-initial">{userInfo.name.charAt(0)}</span>
          </div>
          {/* User full name */}
          <h3 className="user-name">{userInfo.name}</h3>
          {/* Program and intake year */}
          <p className="user-program">{displayProgram} • {displayIntakeYear}</p>
          {/* ERP info */}
          <p className="user-erp">ERP • {displayERP}</p>
        </div>

        {/* --------------------------
            NAVIGATION TABS
            -------------------------- */}
        <nav className="navigation-tabs">
          {navigationItems.map(item => (
            <button
              key={item.id}
              className={`nav-tab ${activeView === item.id ? 'active' : ''}`} // Highlight active tab
              onClick={() => setActiveView(item.id)} // Switch view on click
            >
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* --------------------------
            LOGOUT BUTTON
            -------------------------- */}
        <div className="logout-section">
          <button onClick={onLogout} className="sidebar-logout-btn">
            Logout
          </button>
        </div>

      </aside>

      {/* ==========================
          MAIN CONTENT AREA
          ========================== */}
      <main className="dashboard-main">

        {/* Dashboard header with title & subtitle */}
        <header className="dashboard-header">
          <h1 className="header-title">{headerInfo.title}</h1>
          <p className="header-subtitle">{headerInfo.subtitle}</p>
        </header>

        {/* Full width content panel */}
        <div className="content-area-full">
          <div className="content-panel-full">
            {renderMainContent()} {/* Render the currently active view */}
          </div>
        </div>

      </main>

    </div>
  );
};

// Export component as default
export default StudentDashboard;
