import React, { useState } from "react";

/*
  Import pages accessible to Building Incharge:
  - Add announcements
  - View announcements
  - Add bookings (for breakout rooms)
  - View bookings
*/
import AddAnnouncement from "../pages/AddAnnouncements";
import ViewAnnouncements from "../pages/ViewAnnouncements";
import AddBooking from "../pages/AddBooking_BI";
import ViewBooking from "../pages/ViewBooking_BI";

import "./BuildingIncharge.css";

/*
  BuildingIncharge Dashboard Component
  Acts as the main layout and navigation controller
  for all Building Incharge functionalities.
*/
const BuildingIncharge = ({ onLogout }) => {

  // Controls which page/component is currently visible
  // Default view is "Add Booking"
  const [active, setActive] = useState("add-booking");

  /*
    Renders the selected page based on sidebar navigation.
    Avoids routing and keeps navigation state-based.
  */
  const renderPage = () => {
    switch (active) {
      case "add-booking": 
        return <AddBooking />;
      case "add-announcement": 
        return <AddAnnouncement />;
      case "view-booking": 
        return <ViewBooking />;
      case "view-announcement": 
        return <ViewAnnouncements />;
      default: 
        return <AddBooking />;
    }
  };

  return (
    <div className="program-office-dashboard">

      {/* Sidebar Navigation Section */}
      <aside className="navigation-sidebar">

        {/* Logged-in user information */}
        <div className="user-info-section">
          <div className="profile-circle">
            <span>B</span>
          </div>
          <h3 className="user-name">Building Incharge</h3>
          <p className="user-program">Administrator</p>
        </div>

        {/* Sidebar navigation buttons */}
        <nav className="navigation-tabs">

          {/* Navigate to Add Booking screen */}
          <button
            className={`nav-tab ${active === "add-booking" ? "active" : ""}`}
            onClick={() => setActive("add-booking")}
          >
            Add Booking
          </button>

          {/* Navigate to Add Announcement screen */}
          <button
            className={`nav-tab ${active === "add-announcement" ? "active" : ""}`}
            onClick={() => setActive("add-announcement")}
          >
            Add Announcement
          </button>

          {/* Navigate to View Bookings screen */}
          <button
            className={`nav-tab ${active === "view-booking" ? "active" : ""}`}
            onClick={() => setActive("view-booking")}
          >
            View Bookings
          </button>

          {/* Navigate to View Announcements screen */}
          <button
            className={`nav-tab ${active === "view-announcement" ? "active" : ""}`}
            onClick={() => setActive("view-announcement")}
          >
            View Announcements
          </button>

        </nav>

        {/* Logout action */}
        <div className="logout-section">
          <button onClick={onLogout} className="sidebar-logout-btn">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Dashboard Content Area */}
      <main className="dashboard-main">

        {/* Dashboard header */}
        <header className="dashboard-header">
          <h1 className="header-title">Building Incharge Dashboard</h1>
          <p className="header-subtitle">
            Manage bookings & announcements
          </p>
        </header>

        {/* Render selected page */}
        <div className="content-area-full">
          <div className="content-panel-full">
            {renderPage()}
          </div>
        </div>

      </main>
    </div>
  );
};

export default BuildingIncharge;
