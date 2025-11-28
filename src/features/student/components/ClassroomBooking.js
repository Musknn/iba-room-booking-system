import React, { useState, useEffect } from 'react';
import './ClassroomBooking.css';

const ClassroomBooking = ({ studentERP }) => {
  const [filters, setFilters] = useState({
    buildingId: '',
    date: '',
    timeSlot: ''
  });
  const [availableRooms, setAvailableRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [purpose, setPurpose] = useState('');

  // Time slots
  const timeSlots = [
    { value: '08:30-09:45', label: '8:30-9:45', start: '08:30', end: '09:45' },
    { value: '10:00-11:15', label: '10:00-11:15', start: '10:00', end: '11:15' },
    { value: '11:30-12:45', label: '11:30-12:45', start: '11:30', end: '12:45' },
    { value: '13:00-14:15', label: '1:00-2:15', start: '13:00', end: '14:15' },
    { value: '14:30-15:45', label: '2:30-3:45', start: '14:30', end: '15:45' },
    { value: '16:00-17:15', label: '4:00-5:15', start: '16:00', end: '17:15' },
    { value: '17:30-18:45', label: '5:30-6:45', start: '17:30', end: '18:45' }
  ];

  // Fetch buildings on component mount
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
      alert('Failed to load buildings');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const checkAvailability = async () => {
    // Validate all filters are selected
    if (!filters.buildingId || !filters.date || !filters.timeSlot) {
      alert('Please select building, date, and time slot');
      return;
    }

    setLoading(true);
    try {
      const selectedSlot = timeSlots.find(slot => slot.value === filters.timeSlot);
      
      const response = await fetch(
        `http://localhost:5000/api/booking/available-rooms?` +
        `date=${filters.date}&startTime=${selectedSlot.start}&endTime=${selectedSlot.end}&buildingId=${filters.buildingId}&roomType=Classroom`
      );
      
      const data = await response.json();
      
      if (data.success) {
        setAvailableRooms(data.data);
      } else {
        alert('Error fetching available rooms');
        setAvailableRooms([]);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to check availability');
      setAvailableRooms([]);
    }
    setLoading(false);
  };

  const handleBookRoom = (room) => {
    setSelectedRoom(room);
  };

  const confirmBooking = async () => {
    if (!purpose.trim()) {
      alert('Please enter booking purpose');
      return;
    }

    try {
      const selectedSlot = timeSlots.find(slot => slot.value === filters.timeSlot);
      
      const response = await fetch('http://localhost:5000/api/booking/create-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          erp: parseInt(studentERP),
          roomId: selectedRoom.ROOM_ID,
          date: filters.date,
          startTime: selectedSlot.start,
          endTime: selectedSlot.end,
          purpose: purpose
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Booking request submitted successfully!');
        // Reset everything
        setSelectedRoom(null);
        setPurpose('');
        setAvailableRooms([]);
        setFilters({
          buildingId: '',
          date: '',
          timeSlot: ''
        });
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking');
    }
  };

  return (
    <div className="classroom-booking">
      <h2>Classroom Booking</h2>
      <p>Book classrooms for academic sessions, lectures, and study groups.</p>
      
      <div className="booking-interface">
        <div className="filters-section">
          <div className="filter-group">
            <label>Select Building:</label>
            <select 
              className="filter-select"
              value={filters.buildingId}
              onChange={(e) => handleFilterChange('buildingId', e.target.value)}
            >
              <option value="">Choose Building</option>
              {buildings.map(building => (
                <option key={building.BUILDING_ID} value={building.BUILDING_ID}>
                  {building.BUILDING_NAME}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Select Date:</label>
            <input 
              type="date" 
              className="filter-select"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label>Time Slot:</label>
            <select 
              className="filter-select"
              value={filters.timeSlot}
              onChange={(e) => handleFilterChange('timeSlot', e.target.value)}
            >
              <option value="">Choose Time Slot</option>
              {timeSlots.map(slot => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>&nbsp;</label>
            <button 
              className="book-btn"
              onClick={checkAvailability}
              disabled={loading}
              style={{ marginTop: '25px' }}
            >
              {loading ? 'Searching...' : 'Search Available Rooms'}
            </button>
          </div>
        </div>
        
        <div className="available-classrooms">
          <h3>
            Available Classrooms 
            {availableRooms.length > 0 && ` (${availableRooms.length})`}
          </h3>
          
          {availableRooms.length > 0 ? (
            <div className="classrooms-list">
              {availableRooms.map(room => (
                <div key={room.ROOM_ID} className="classroom-card">
                  <h4>{room.ROOM_NAME}</h4>
                  <p>Type: {room.ROOM_TYPE}</p>
                  <p>Building: {room.BUILDING_NAME}</p>
                  <p className="features">Room ID: {room.ROOM_ID}</p>
                  <button 
                    className="book-btn"
                    onClick={() => handleBookRoom(room)}
                  >
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#666',
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              {loading ? 'Searching for available classrooms...' : 'No classrooms available for selected criteria'}
            </div>
          )}
        </div>

        {/* Booking Modal */}
        {selectedRoom && (
          <div className="booking-modal" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              padding: '30px',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '500px'
            }}>
              <h3>Confirm Booking</h3>
              <div style={{ marginBottom: '20px' }}>
                <p><strong>Room:</strong> {selectedRoom.ROOM_NAME}</p>
                <p><strong>Building:</strong> {selectedRoom.BUILDING_NAME}</p>
                <p><strong>Date:</strong> {filters.date}</p>
                <p><strong>Time:</strong> {filters.timeSlot}</p>
                <p><strong>ERP:</strong> {studentERP}</p>
              </div>
              
              <div className="form-group">
                <label>Purpose *</label>
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Describe the purpose of your booking..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button 
                  className="book-btn"
                  onClick={confirmBooking}
                  style={{ flex: 1 }}
                >
                  Confirm Booking
                </button>
                <button 
                  onClick={() => setSelectedRoom(null)}
                  style={{
                    flex: 1,
                    background: '#666',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassroomBooking;