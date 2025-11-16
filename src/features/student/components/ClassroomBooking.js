import React from 'react';
import './ClassroomBooking.css';

const ClassroomBooking = () => {
  return (
    <div className="classroom-booking">
      <h2>Classroom Booking</h2>
      <p>Book classrooms for academic sessions, lectures, and study groups.</p>
      
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
        
        <div className="available-classrooms">
          <h3>Available Classrooms</h3>
          <div className="classrooms-list">
            <div className="classroom-card">
              <h4>Room 101</h4>
              <p>Capacity: 50 students</p>
              <p>Building A, 1st Floor</p>
              <button className="book-btn">Book Now</button>
            </div>
            
            <div className="classroom-card">
              <h4>Room 102</h4>
              <p>Capacity: 40 students</p>
              <p>Building A, 1st Floor</p>
              <button className="book-btn">Book Now</button>
            </div>
            
            <div className="classroom-card">
              <h4>Room 201</h4>
              <p>Capacity: 60 students</p>
              <p>Building B, 2nd Floor</p>
              <button className="book-btn">Book Now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassroomBooking;