import React, { useState } from 'react';
import './ViewAllRooms.css';

const ViewAllRooms = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('all');

  const rooms = [
    { id: 1, name: 'Room 101', capacity: 20, floor: '1st', building: 'Building A', available: true },
    { id: 2, name: 'Room 102', capacity: 15, floor: '1st', building: 'Building A', available: false },
    { id: 3, name: 'Conference Room A', capacity: 50, floor: '2nd', building: 'Building B', available: true },
    { id: 4, name: 'Meeting Room B', capacity: 10, floor: '2nd', building: 'Building B', available: true },
    { id: 5, name: 'Seminar Hall', capacity: 100, floor: '3rd', building: 'Building C', available: true },
    { id: 6, name: 'Lab 201', capacity: 30, floor: '2nd', building: 'Building A', available: false },
    { id: 7, name: 'Room 103', capacity: 25, floor: '1st', building: 'Building A', available: true },
    { id: 8, name: 'Conference Room B', capacity: 40, floor: '3rd', building: 'Building B', available: false },
  ];

  const buildings = ['All', 'Building A', 'Building B', 'Building C'];

  // Filter rooms based on search and building selection
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBuilding = selectedBuilding === 'all' || room.building === selectedBuilding;
    return matchesSearch && matchesBuilding;
  });

  return (
    <div className="view-all-rooms">
      <h2>All Rooms</h2>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="buildingFilter">Filter by Building:</label>
          <select
            id="buildingFilter"
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="filter-select"
          >
            {buildings.map(building => (
              <option key={building} value={building === 'All' ? 'all' : building}>
                {building}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="searchRoom">Search Classroom:</label>
          <input
            id="searchRoom"
            type="text"
            placeholder="Search by room name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-stats">
          Showing {filteredRooms.length} of {rooms.length} rooms
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="rooms-grid">
        {filteredRooms.length === 0 ? (
          <div className="no-rooms-found">
            <p>No rooms found matching your criteria.</p>
          </div>
        ) : (
          filteredRooms.map(room => (
            <div key={room.id} className="room-card">
              <h3>{room.name}</h3>
              <p><strong>Building:</strong> {room.building}</p>
              <p><strong>Floor:</strong> {room.floor}</p>
              <p><strong>Capacity:</strong> {room.capacity} people</p>
              <div className={`availability ${room.available ? 'available' : 'occupied'}`}>
                {room.available ? 'AVAILABLE' : 'OCCUPIED'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ViewAllRooms;