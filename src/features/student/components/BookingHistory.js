import React from 'react';
import './BookingHistory.css';

const BookingHistory = () => {
  const bookings = [
    { id: 1, room: 'Room 101', date: '2024-01-12', time: '10:00-11:15', status: 'Confirmed' },
    { id: 2, room: 'Conference Room A', date: '2024-01-10', time: '14:30-15:45', status: 'Completed' },
    { id: 3, room: 'Meeting Room B', date: '2024-01-08', time: '16:00-17:15', status: 'Cancelled' },
    { id: 4, room: 'Seminar Hall', date: '2024-01-05', time: '09:00-10:15', status: 'Completed' },
  ];

  return (
    <div className="booking-history">
      <h2>Booking History</h2>
      <div className="bookings-table">
        <table>
          <thead>
            <tr>
              <th>Room</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr key={booking.id}>
                <td>{booking.room}</td>
                <td>{booking.date}</td>
                <td>{booking.time}</td>
                <td className={`status ${booking.status.toLowerCase()}`}>
                  {booking.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingHistory;