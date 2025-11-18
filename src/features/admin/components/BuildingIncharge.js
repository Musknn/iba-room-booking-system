import React, { useState } from 'react';
import './BuildingIncharge.css'; // This now imports shared styles

const BuildingIncharge = ({ onLogout, userRole }) => {
  const [activeTab, setActiveTab] = useState('room-availability');

  const navigationItems = [
    { id: 'room-availability', label: 'Manage Room Availability' },
    { id: 'building-usage', label: 'Monitor Building Usage' },
    { id: 'maintenance', label: 'Handle Maintenance Requests' },
    { id: 'reports', label: 'Generate Building Reports' }
  ];

  const getHeaderInfo = () => {
    const info = {
      'room-availability': { title: 'Manage Room Availability', subtitle: 'Update room status and availability schedules' },
      'building-usage': { title: 'Monitor Building Usage', subtitle: 'View real-time building occupancy and usage statistics' },
      'maintenance': { title: 'Handle Maintenance Requests', subtitle: 'Manage maintenance issues and repair requests' },
      'reports': { title: 'Generate Building Reports', subtitle: 'Create usage reports and analytics' }
    };
    return info[activeTab] || { title: 'Building Incharge Dashboard', subtitle: 'Manage building operations and daily activities' };
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case 'room-availability':
        return (
          <div className="building-incharge-content">
            <h2>Manage Room Availability</h2>
            <p>Room availability management content coming soon...</p>
          </div>
        );
      case 'building-usage':
        return (
          <div className="building-incharge-content">
            <h2>Monitor Building Usage</h2>
            <p>Building usage monitoring content coming soon...</p>
          </div>
        );
      case 'maintenance':
        return (
          <div className="building-incharge-content">
            <h2>Handle Maintenance Requests</h2>
            <p>Maintenance requests management content coming soon...</p>
          </div>
        );
      case 'reports':
        return (
          <div className="building-incharge-content">
            <h2>Generate Building Reports</h2>
            <p>Report generation content coming soon...</p>
          </div>
        );
      default:
        return (
          <div className="building-incharge-content">
            <h2>Building Incharge Dashboard</h2>
            <p>Select an option from the sidebar to get started.</p>
          </div>
        );
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="building-incharge-dashboard">
      {/* Left Sidebar - Navigation */}
      <aside className="navigation-sidebar">
        {/* User Info Section */}
        <div className="user-info-section">
          <div className="profile-circle">
            <span className="profile-initial">B</span>
          </div>
          <h3 className="user-name">Building Incharge</h3>
          <p className="user-program">Administrator</p>
        </div>

        {/* Navigation Tabs */}
        <nav className="navigation-tabs">
          {navigationItems.map(item => (
            <button
              key={item.id}
              className={`nav-tab ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
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

        {/* Content Area - Full width */}
        <div className="content-area-full">
          <div className="content-panel-full">
            {renderMainContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BuildingIncharge;