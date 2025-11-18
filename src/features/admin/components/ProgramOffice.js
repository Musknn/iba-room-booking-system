import React, { useState, useEffect } from 'react';
import './ProgramOffice.css';

const ProgramOffice = ({ onLogout, userRole }) => {
  const [activeTab, setActiveTab] = useState('add-building');
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  
  // Building form state - REMOVED unnecessary fields
  const [buildingForm, setBuildingForm] = useState({
    name: '',
    inchargeName: '',
    inchargeEmail: '',
    inchargeERP: ''  // Added ERP field
  });

  // Room form state - REMOVED unnecessary fields
  const [roomForm, setRoomForm] = useState({
    buildingName: '',  // Changed from buildingId to buildingName
    roomName: '',
    roomType: ''  // Added roomType field
  });

  const navigationItems = [
    { id: 'add-building', label: 'Add Buildings & Rooms' },
    { id: 'manage-incharges', label: 'Manage Incharges' },
    { id: 'booking-requests', label: 'Booking Requests' },
    { id: 'approve-bookings', label: 'Approve/Reject' }
  ];

  // Fetch buildings from backend
  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/buildings');
      const data = await response.json();
      setBuildings(data);
    } catch (error) {
      console.error('Error fetching buildings:', error);
      alert('Failed to fetch buildings');
    }
  };

  const handleAddBuilding = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/buildings/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: buildingForm.name,
          inchargeERP: parseInt(buildingForm.inchargeERP),
          inchargeName: buildingForm.inchargeName,
          inchargeEmail: buildingForm.inchargeEmail
        })
      });

      const result = await response.json();
      alert(result.message || result.error);
      
      if (response.ok) {
        // Reset form and refresh buildings list
        setBuildingForm({ name: '', inchargeName: '', inchargeEmail: '', inchargeERP: '' });
        fetchBuildings();
      }
    } catch (error) {
      console.error('Error adding building:', error);
      alert('Failed to add building');
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    if (!roomForm.buildingName) {
      alert('Please select a building first');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/buildings/rooms/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buildingName: roomForm.buildingName,
          roomName: roomForm.roomName,
          roomType: roomForm.roomType
        })
      });

      const result = await response.json();
      alert(result.message || result.error);
      
      if (response.ok) {
        // Reset form
        setRoomForm({ buildingName: '', roomName: '', roomType: '' });
      }
    } catch (error) {
      console.error('Error adding room:', error);
      alert('Failed to add room');
    }
  };

  const getHeaderInfo = () => {
    const info = {
      'add-building': { title: 'Add Buildings & Rooms', subtitle: 'Add new buildings and manage rooms' },
      'manage-incharges': { title: 'Manage Building Incharges', subtitle: 'Assign and manage building incharges' },
      'booking-requests': { title: 'View Booking Requests', subtitle: 'Manage and review room booking requests' },
      'approve-bookings': { title: 'Approve/Reject Bookings', subtitle: 'Accept or reject bookings with reasons' }
    };
    return info[activeTab] || { title: 'Program Office Dashboard', subtitle: 'Manage buildings, rooms, and student booking requests' };
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case 'add-building':
        return (
          <div className="program-office-content">
            <div className="forms-grid">
              {/* Section 1: Add Building */}
              <div className="form-section">
                <h2>1. Add Building Details</h2>
                <form onSubmit={handleAddBuilding} className="building-form">
                  <div className="form-group">
                    <label>Building Name *</label>
                    <input
                      type="text"
                      value={buildingForm.name}
                      onChange={(e) => setBuildingForm({...buildingForm, name: e.target.value})}
                      placeholder="e.g., Tabba Academic Building"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Incharge Name *</label>
                      <input
                        type="text"
                        value={buildingForm.inchargeName}
                        onChange={(e) => setBuildingForm({...buildingForm, inchargeName: e.target.value})}
                        placeholder="Full name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Incharge ERP *</label>
                      <input
                        type="number"
                        value={buildingForm.inchargeERP}
                        onChange={(e) => setBuildingForm({...buildingForm, inchargeERP: e.target.value})}
                        placeholder="e.g., 1001"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={buildingForm.inchargeEmail}
                      onChange={(e) => setBuildingForm({...buildingForm, inchargeEmail: e.target.value})}
                      placeholder="incharge@iba.edu.pk"
                      required
                    />
                  </div>

                  <button type="submit" className="maroon-btn">
                    Add Building
                  </button>
                </form>
              </div>

              {/* Section 2: Add Room */}
              <div className="form-section">
                <h2>2. Add Room to Building</h2>
                <form onSubmit={handleAddRoom} className="room-form">
                  <div className="form-group">
                    <label>Select Building *</label>
                    <select
                      value={roomForm.buildingName}
                      onChange={(e) => setRoomForm({...roomForm, buildingName: e.target.value})}
                      required
                    >
                      <option value="">Choose a building</option>
                      {buildings.map(building => (
                        <option key={building.BUILDING_ID} value={building.BUILDING_NAME}>
                          {building.BUILDING_NAME}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Room Name *</label>
                      <input
                        type="text"
                        value={roomForm.roomName}
                        onChange={(e) => setRoomForm({...roomForm, roomName: e.target.value})}
                        placeholder="e.g., Room 101, Lab A"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Room Type *</label>
                      <select
                        value={roomForm.roomType}
                        onChange={(e) => setRoomForm({...roomForm, roomType: e.target.value})}
                        required
                      >
                        <option value="">Select type</option>
                        <option value="Classroom">Classroom</option>
                        <option value="Lab">Lab</option>
                        <option value="Conference">Conference Room</option>
                        <option value="Breakout">Breakout Room</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="maroon-btn">
                    Add Room
                  </button>
                </form>
              </div>
            </div>

            {/* Display Added Data */}
            <div className="data-display">
              <div className="data-section">
                <h3>Available Buildings ({buildings.length})</h3>
                <div className="data-list">
                  {buildings.map(building => (
                    <div key={building.BUILDING_ID} className="data-item">
                      <div className="data-title">{building.BUILDING_NAME}</div>
                      <div className="data-info">Building ID: {building.BUILDING_ID}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      // ... rest of your existing cases remain the same
      case 'manage-incharges':
        return (
          <div className="program-office-content">
            <h2>Manage Building Incharges</h2>
            <p>Building incharge management content coming soon...</p>
          </div>
        );

      case 'booking-requests':
        return (
          <div className="program-office-content">
            <h2>View Booking Requests</h2>
            <p>Booking requests management content coming soon...</p>
          </div>
        );

      case 'approve-bookings':
        return (
          <div className="program-office-content">
            <h2>Approve/Reject Bookings</h2>
            <p>Booking approval content coming soon...</p>
          </div>
        );

      default:
        return (
          <div className="program-office-content">
            <h2>Program Office Dashboard</h2>
            <p>Select an option from the sidebar to get started.</p>
          </div>
        );
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="program-office-dashboard">
      {/* Left Sidebar - Navigation */}
      <aside className="navigation-sidebar">
        {/* User Info Section */}
        <div className="user-info-section">
          <div className="profile-circle">
            <span className="profile-initial">P</span>
          </div>
          <h3 className="user-name">Program Office</h3>
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

export default ProgramOffice;