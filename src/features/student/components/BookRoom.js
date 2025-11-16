import React from 'react';
import './BookRoom.css';

const BookRoom = () => {
  return (
    <div className="book-room">
      <h2>Book a Room</h2>
      <p>Select a room, choose your time slot, and make a reservation for your study sessions or group meetings.</p>
      <div className="booking-placeholder">
        <p>📅 Booking calendar and room selection will appear here</p>
        <p style={{fontSize: '14px', marginTop: '10px'}}>Time slots: 8:30-9:45, 10:00-11:15, 11:30-12:45, 1:00-2:15, 2:30-3:45, 4:00-5:15, 5:30-6:45</p>
      </div>
    </div>
  );
};

export default BookRoom;