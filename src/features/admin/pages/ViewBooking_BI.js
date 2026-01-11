import React, { useEffect, useState } from "react";
import "./ViewBooking.css"; // Styling for booking cards and layout

const ViewBooking = () => {

  // Stores all breakout room bookings for the Building Incharge
  const [bookings, setBookings] = useState([]);

  // Controls loading state for API calls
  const [loading, setLoading] = useState(false);
  
  // Building Incharge ERP fetched from localStorage
  // Ideally should come from auth/session context
  const buildingInchargeERP = localStorage.getItem("erp");
  // Replace with actual ERP from auth context

  // Load bookings when component mounts
  useEffect(() => {
    loadBookings();
  }, []);

  // Fetch booking history for the Building Incharge
  const loadBookings = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/reservation/bi/history?erp=${buildingInchargeERP}`
      );

      const result = await response.json();
      console.log("BUILDING INCHARGE BOOKINGS:", result);

      if (result.success) {
        // Sort bookings by most recent (descending booking ID)
        const sorted = result.data.sort(
          (a, b) => Number(b.BOOKING_ID) - Number(a.BOOKING_ID)
        );
        setBookings(sorted);
      } else {
        alert(result.error || "Failed to load bookings");
      }
    } catch (err) {
      console.error("Error loading bookings:", err);
      alert("Server unavailable");
    } finally {
      setLoading(false);
    }
  };

  // Reject a breakout room booking
  const rejectBooking = async (bookingId) => {

    // Confirmation before rejection
    if (!window.confirm("Reject this breakout room booking?")) return;

    try {
      const response = await fetch(
        "http://localhost:5000/api/reservation/reject",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            booking_id: bookingId, 
            role: "BuildingIncharge", // Role sent for backend authorization
            incharge_erp: buildingInchargeERP
          }),
        }
      );

      const result = await response.json();
      alert(result.message);

      // Reload bookings after successful rejection
      if (result.success) {
        loadBookings();
      }
    } catch (err) {
      console.error("Reject Error:", err);
    }
  };

  // Approve a breakout room booking
  // Uses backend PL/SQL approval procedure
  const approveBooking = async (bookingId) => {

    // Confirmation before approval
    if (!window.confirm("Approve this breakout room booking?")) return;

    try {
      const response = await fetch(
        "http://localhost:5000/api/reservation/approve",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            booking_id: bookingId, 
            role: "BI", // Short role identifier for backend
            incharge_erp: buildingInchargeERP
          }),
        }
      );

      const result = await response.json();
      alert(result.message);

      // Reload bookings after approval
      if (result.success) {
        loadBookings();
      }
    } catch (err) {
      console.error("Approve Error:", err);
      alert("Approval failed");
    }
  };

  // Formats date to YYYY-MM-DD for display
  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toISOString().substring(0, 10);
  };

  return (
    <div className="booking-admin-container">

      {/* Header section */}
      <div className="booking-header-row">
        <div>
          <h2 className="title">Breakout Room Reservations</h2>
          <p className="subtitle">
            Building Incharge View (ERP: {buildingInchargeERP})
          </p>

          {/* Booking count */}
          <div className="filter-info">
            Showing {bookings.length} breakout room bookings
          </div>
        </div>

        {/* Manual refresh button */}
        <button
          className="view-all-btn"
          onClick={loadBookings}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Booking cards container */}
      <div className="booking-card-list">
        {loading ? (
          <p className="loading-text">
            Loading breakout room bookings...
          </p>
        ) : bookings.length === 0 ? (
          <p className="no-data-text">
            No breakout room bookings found for your building.
          </p>
        ) : (
          bookings.map((b) => (
            <div
              key={b.BOOKING_ID}
              className="booking-card breakout-room-card"
            >
              {/* Card header */}
              <div className="card-header">
                <div>
                  <h3 className="room-name">{b.ROOM_NAME}</h3>
                  <p className="building-name">{b.BUILDING_NAME}</p>
                </div>

                {/* Booking status badge */}
                <span
                  className={`status-badge ${
                    b.STATUS === "Approved"
                      ? "confirmed"
                      : b.STATUS === "Rejected" || b.STATUS === "Cancelled"
                      ? "rejected"
                      : "pending"
                  }`}
                >
                  {b.STATUS}
                </span>
              </div>

              {/* Card body details */}
              <div className="card-body">
                <p><strong>Student ERP:</strong> {b.ERP}</p>
                <p><strong>Booking ID:</strong> {b.BOOKING_ID}</p>
                <p><strong>Date:</strong> {formatDate(b.BOOKING_DATE)}</p>
                <p><strong>Time:</strong> {b.START_TIME} - {b.END_TIME}</p>
                <p><strong>Purpose:</strong> {b.PURPOSE}</p>
                {b.CAPACITY && <p><strong>Capacity:</strong> {b.CAPACITY}</p>}
                {b.ROOM_TYPE && <p><strong>Room Type:</strong> {b.ROOM_TYPE}</p>}
              </div>

              {/* Action buttons based on booking status */}
              <div className="card-actions">
                {b.STATUS === "Pending" ? (
                  <>
                    <button
                      className="approve-btn"
                      onClick={() => approveBooking(b.BOOKING_ID)}
                    >
                      Approve
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => rejectBooking(b.BOOKING_ID)}
                    >
                      Reject
                    </button>
                  </>
                ) : b.STATUS === "Approved" ? (
                  <button
                    className="reject-btn"
                    onClick={() => rejectBooking(b.BOOKING_ID)}
                  >
                    Reject Booking
                  </button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ViewBooking;
