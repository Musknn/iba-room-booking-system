import React, { useState } from 'react';
import './StudentDashboard.css';
import ViewAllRooms from '../components/ViewAllRooms';
import ClassroomBooking from '../components/ClassroomBooking';
import BreakoutBooking from '../components/BreakoutBooking';
import Announcements from '../components/Announcements';
import BookingHistory from '../components/BookingHistory';

const StudentDashboard = ({ onLogout }) => {
  const [activeView, setActiveView] = useState('viewAllRooms');

  const userInfo = {
    name: 'Muskan',
    program: 'BSCS',
    intakeYear: '2023',
    erp: '28394'
  };

  const getHeaderTitle = () => {
    switch (activeView) {
      case 'viewAllRooms': return 'View All Rooms';
      case 'classroom': return 'Classroom Booking';
      case 'breakout': return 'Breakout Room Booking';
      case 'announcements': return 'Announcements';
      case 'bookingHistory': return 'Booking History';
      default: return 'Student Dashboard';
    }
  };

  const getHeaderSubtitle = () => {
    switch (activeView) {
      case 'viewAllRooms': return 'Browse and filter all available rooms';
      case 'classroom': return 'Reserve classrooms for academic purposes';
      case 'breakout': return 'Book breakout rooms for group discussions';
      case 'announcements': return 'Latest university updates and notices';
      case 'bookingHistory': return 'View and manage your reservations';
      default: return 'Manage your room bookings';
    }
  };

  const renderMainContent = () => {
    switch (activeView) {
      case 'viewAllRooms':
        return <ViewAllRooms />;
      case 'classroom':
        return <ClassroomBooking />;
      case 'breakout':
        return <BreakoutBooking />;
      case 'announcements':
        return <Announcements />;
      case 'bookingHistory':
        return <BookingHistory />;
      default:
        return <ViewAllRooms />;
    }
  };

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
          <p className="user-program">{userInfo.program} • {userInfo.intakeYear}</p>
        </div>

        {/* Navigation Tabs */}
        <nav className="navigation-tabs">
          <button 
            className={`nav-tab ${activeView === 'viewAllRooms' ? 'active' : ''}`}
            onClick={() => setActiveView('viewAllRooms')}
          >
            <span className="nav-icon">🏢</span>
            <span>View All Rooms</span>
          </button>

          <button 
            className={`nav-tab ${activeView === 'classroom' ? 'active' : ''}`}
            onClick={() => setActiveView('classroom')}
          >
            <span className="nav-icon">📚</span>
            <span>Classroom</span>
          </button>

          <button 
            className={`nav-tab ${activeView === 'breakout' ? 'active' : ''}`}
            onClick={() => setActiveView('breakout')}
          >
            <span className="nav-icon">👥</span>
            <span>Breakout Room</span>
          </button>

          <button 
            className={`nav-tab ${activeView === 'announcements' ? 'active' : ''}`}
            onClick={() => setActiveView('announcements')}
          >
            <span className="nav-icon">📢</span>
            <span>Announcements</span>
          </button>

          <button 
            className={`nav-tab ${activeView === 'bookingHistory' ? 'active' : ''}`}
            onClick={() => setActiveView('bookingHistory')}
          >
            <span className="nav-icon">📋</span>
            <span>Booking History</span>
          </button>
        </nav>

        {/* Logout Section */}
        <div className="logout-section">
          <button onClick={onLogout} className="sidebar-logout-btn">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <h1 className="header-title">{getHeaderTitle()}</h1>
          <p className="header-subtitle">{getHeaderSubtitle()}</p>
        </header>

        {/* Content Area */}
        <div className="content-area">
          <div className="content-panel">
            {renderMainContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;