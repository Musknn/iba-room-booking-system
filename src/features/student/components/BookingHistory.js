import React, { useState, useEffect } from 'react';
import './BookingHistory.css';

/**
 * BookingHistory Component
 * --------------------------------------------------
 * This component allows a student to:
 * - View their past and current room bookings
 * - Refresh booking history
 * - Cancel eligible bookings (Approved / Pending)
 *
 * Data is fetched from the backend using the student's ERP,
 * which is stored in localStorage after login.
 */
const BookingHistory = () => {

  /* ================================
     STATE VARIABLES
     ================================ */

  // Stores the list of bookings returned from the backend
  const [bookings, setBookings] = useState([]);

  // Controls loading state for bookings fetch
  const [loading, setLoading] = useState(true);

  /* ================================
     INITIAL DATA FETCH
     ================================ */

  // Fetch booking history when component mounts
  useEffect(() => {
    loadBookings();
  }, []);

  /* ================================
     FETCH BOOKING HISTORY
     ================================ */

  const loadBookings = async () => {
    setLoading(true);

    try {
      // Retrieve student ERP from localStorage
      // ERP uniquely identifies the logged-in student
      const erp = localStorage.getItem("erp");

      // If ERP is missing, user is not logged in
      if (!erp) {
        alert("Please login to view booking history");
        setLoading(false);
        return;
      }

      // Backend API call to fetch student booking history
      const response = await fetch(
        `http://localhost:5000/api/reservation/student/history?erp=${erp}`
      );

      const result = await response.json();
      console.log("STUDENT BOOKINGS:", result);

      if (result.success) {
        // Sort bookings so newest appear first
        // BOOKING_ID is used as it increases sequentially
        const sorted = result.data.sort(
          (a, b) => Number(b.BOOKING_ID) - Number(a.BOOKING_ID)
        );

        setBookings(sorted);
      } else {
        alert(result.error || "Failed to load your bookings.");
      }
    } catch (err) {
      // Handles network or server issues
      console.error("Error loading student bookings:", err);
      alert("Server unavailable");
    } finally {
      // Always disable loading state
      setLoading(false);
    }
  };

  /* ================================
     CANCEL BOOKING
     ================================ */

  const cancelBooking = async (bookingId) => {
    // Ask user for confirmation before cancelling
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      // Retrieve ERP for authorization
      const erp = localStorage.getItem("erp");

      // Backend API call to cancel booking
      const response = await fetch(
        "http://localhost:5000/api/reservation/cancel",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            booking_id: bookingId,
            erp: erp // Backend requires both booking ID and ERP
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        alert(result.message || "Booking cancelled successfully");

        // Reload bookings to reflect changes
        loadBookings();
      } else {
        alert(result.message || "Could not cancel booking");
      }
    } catch (err) {
      console.error("Cancel error:", err);
      alert("Server error");
    }
  };

  /* ================================
     FORMAT HELPERS
     ================================ */

  // Formats date into readable form (e.g., Jan 12, 2026)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Formats time into 12-hour format with AM/PM
  const formatTime = (timeString) => {
    if (!timeString) return '';

    // Handle ISO timestamps
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

  /* ================================
     STATUS BADGE CLASS HANDLER
     ================================ */

  // Maps booking status to CSS class
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'status-approved';
      case 'pending':
        return 'status-pending';
      case 'rejected':
        return 'status-rejected';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-unknown';
    }
  };

  /* ================================
     UI RENDER
     ================================ */

  return (
    <div className="booking-history-container">

      {/* ---------- HEADER ---------- */}
      <div className="booking-history-header">
        <div>
          <h2>My Booking History</h2>
          <p>View and manage your room reservations</p>
        </div>

        {/* Refresh button to re-fetch booking history */}
        <button
          onClick={loadBookings}
          className="refresh-btn"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* ---------- LOADING STATE ---------- */}
      {loading ? (
        <div className="loading-container">
          <p>Loading your bookings...</p>
        </div>
      ) : (
        <div className="bookings-table-container">

          {/* ---------- EMPTY STATE ---------- */}
          {bookings.length === 0 ? (
            <div className="no-bookings">
              <p>No bookings found. Make your first reservation!</p>
            </div>
          ) : (

            /* ---------- BOOKINGS TABLE ---------- */
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
                  <tr
                    key={booking.BOOKING_ID}
                    className="booking-row"
                  >
                    <td className="booking-id">{booking.BOOKING_ID}</td>

                    {/* Handles uppercase/lowercase backend fields */}
                    <td className="room-name">
                      {booking.ROOM_NAME || booking.room_name}
                    </td>

                    <td className="building-name">
                      {booking.BUILDING_NAME || booking.building_name}
                    </td>

                    <td className="booking-date">
                      {formatDate(booking.BOOKING_DATE || booking.booking_date)}
                    </td>

                    <td className="start-time">
                      {formatTime(booking.START_TIME || booking.start_time)}
                    </td>

                    <td className="end-time">
                      {formatTime(booking.END_TIME || booking.end_time)}
                    </td>

                    <td className="purpose">
                      {booking.PURPOSE || booking.purpose}
                    </td>

                    {/* Status badge with dynamic styling */}
                    <td className="status-cell">
                      <span
                        className={`status-badge ${getStatusClass(
                          booking.STATUS || booking.status
                        )}`}
                      >
                        {booking.STATUS || booking.status}
                      </span>
                    </td>

                    {/* Cancel action allowed only for Approved & Pending */}
                    <td className="actions-cell">
                      {(booking.STATUS === 'Approved' ||
                        booking.status === 'Approved' ||
                        booking.STATUS === 'Pending' ||
                        booking.status === 'Pending') && (
                        <button
                          className="cancel-btn"
                          onClick={() =>
                            cancelBooking(
                              booking.BOOKING_ID || booking.booking_id
                            )
                          }
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
