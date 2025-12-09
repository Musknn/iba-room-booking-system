import React, { useState, useEffect } from 'react';
import './BookingHistory.css';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      // Get student ERP from localStorage
      const erp = localStorage.getItem("erp");
      
      if (!erp) {
        alert("Please login to view booking history");
        setLoading(false);
        return;
      }

      // Use the correct endpoint from your backend
      const response = await fetch(
        `http://localhost:5000/api/reservation/student/history?erp=${erp}`
      );

      const result = await response.json();
      console.log("STUDENT BOOKINGS:", result);

      if (result.success) {
        // Sort by booking_id descending (newest first)
        const sorted = result.data.sort(
          (a, b) => Number(b.BOOKING_ID) - Number(a.BOOKING_ID)
        );
        setBookings(sorted);
      } else {
        alert(result.error || "Failed to load your bookings.");
      }
    } catch (err) {
      console.error("Error loading student bookings:", err);
      alert("Server unavailable");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const erp = localStorage.getItem("erp");
      
      const response = await fetch(
        "http://localhost:5000/api/reservation/cancel",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            booking_id: bookingId,
            erp: erp  // Only booking_id and erp needed
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        alert(result.message || "Booking cancelled successfully");
        loadBookings();
      } else {
        alert(result.message || "Could not cancel booking");
      }
    } catch (err) {
      console.error("Cancel error:", err);
      alert("Server error");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    // If time is in ISO format (2025-12-09T04:00:00.000Z), extract just the time
    if (timeString.includes('T')) {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
    return timeString;
  };

  const getStatusClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'approved': return 'status-approved';
      case 'pending': return 'status-pending';
      case 'rejected': return 'status-rejected';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-unknown';
    }
  };

  return (
    <div className="booking-history-container">
      <div className="booking-history-header">
        <div>
          <h2>My Booking History</h2>
          <p>View and manage your room reservations</p>
        </div>
        <button 
          onClick={loadBookings} 
          className="refresh-btn"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <p>Loading your bookings...</p>
        </div>
      ) : (
        <div className="bookings-table-container">
          {bookings.length === 0 ? (
            <div className="no-bookings">
              <p>No bookings found. Make your first reservation!</p>
            </div>
          ) : (
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Room</th>
                  <th>Building</th>
                  <th>Date</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.BOOKING_ID} className="booking-row">
                    <td className="booking-id">{booking.BOOKING_ID}</td>
                    <td className="room-name">{booking.ROOM_NAME || booking.room_name}</td>
                    <td className="building-name">{booking.BUILDING_NAME || booking.building_name}</td>
                    <td className="booking-date">{formatDate(booking.BOOKING_DATE || booking.booking_date)}</td>
                    <td className="start-time">{formatTime(booking.START_TIME || booking.start_time)}</td>
                    <td className="end-time">{formatTime(booking.END_TIME || booking.end_time)}</td>
                    <td className="purpose">{booking.PURPOSE || booking.purpose}</td>
                    <td className="status-cell">
                      <span className={`status-badge ${getStatusClass(booking.STATUS || booking.status)}`}>
                        {booking.STATUS || booking.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      {(booking.STATUS === 'Approved' || booking.status === 'Approved') && (
                        <button 
                          className="cancel-btn"
                          onClick={() => cancelBooking(booking.BOOKING_ID || booking.booking_id)}
                        >
                          Cancel
                        </button>
                      )}
                      {(booking.STATUS === 'Pending' || booking.status === 'Pending') && (
                        <button 
                          className="cancel-btn"
                          onClick={() => cancelBooking(booking.BOOKING_ID || booking.booking_id)}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingHistory;