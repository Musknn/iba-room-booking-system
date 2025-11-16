import React from 'react';
import './BreakoutBooking.css';

const BreakoutBooking = () => {
  return (
    <div className="breakout-booking">
      <h2>Breakout Room Booking</h2>
      <p>Book small breakout rooms for group discussions, team meetings, and collaborative work.</p>
      
      <div className="booking-interface">
        <div className="filters-section">
          <div className="filter-group">
            <label>Select Building:</label>
            <select className="filter-select">
              <option>All Buildings</option>
              <option>Building A</option>
              <option>Building B</option>
              <option>Building C</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Select Date:</label>
            <input type="date" className="filter-select" />
          </div>
          
          <div className="filter-group">
            <label>Time Slot:</label>
            <select className="filter-select">
              <option>8:30-9:45</option>
              <option>10:00-11:15</option>
              <option>11:30-12:45</option>
              <option>1:00-2:15</option>
              <option>2:30-3:45</option>
              <option>4:00-5:15</option>
              <option>5:30-6:45</option>
            </select>
          </div>
        </div>
        
        <div className="available-breakout-rooms">
          <h3>Available Breakout Rooms</h3>
          <div className="breakout-rooms-list">
            <div className="breakout-room-card">
              <h4>Breakout Room 1</h4>
              <p>Capacity: 8 people</p>
              <p>Building A, Ground Floor</p>
              <p className="features">Whiteboard • Projector</p>
              <button className="book-btn">Book Now</button>
            </div>
            
            <div className="breakout-room-card">
              <h4>Breakout Room 2</h4>
              <p>Capacity: 6 people</p>
              <p>Building B, 1st Floor</p>
              <p className="features">TV Screen • Conference Phone</p>
              <button className="book-btn">Book Now</button>
            </div>
            
            <div className="breakout-room-card">
              <h4>Collaboration Space A</h4>
              <p>Capacity: 10 people</p>
              <p>Building C, 2nd Floor</p>
              <p className="features">Smart Board • Video Conferencing</p>
              <button className="book-btn">Book Now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakoutBooking;