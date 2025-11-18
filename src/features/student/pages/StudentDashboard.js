import React, { useState } from 'react';
import './StudentDashboard.css'; // This now imports shared styles
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
    switch (activeView) {
      case 'viewAllRooms': return <ViewAllRooms />;
      case 'classroom': return <ClassroomBooking />;
      case 'breakout': return <BreakoutBooking />;
      case 'announcements': return <Announcements />;
      case 'bookingHistory': return <BookingHistory />;
      default: return <ViewAllRooms />;
    }
  };

  const headerInfo = getHeaderInfo();

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
          <p className="user-erp">ERP: {userInfo.erp}</p>
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

        {/* Content Area - This ensures ALL components get the same container */}
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