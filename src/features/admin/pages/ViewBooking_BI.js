import React, { useEffect, useState } from "react";
import "./ViewBooking.css";

const ViewBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Building Incharge's ERP - this should come from authentication/session
  const buildingInchargeERP = localStorage.getItem("erp");
 // Replace with actual ERP from auth context

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/reservation/bi/history?erp=${buildingInchargeERP}`
      );

      const result = await response.json();
      console.log("BUILDING INCHARGE BOOKINGS:", result);

      if (result.success) {
        // Sort using booking_id from object
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

  const rejectBooking = async (bookingId) => {
    if (!window.confirm("Reject this breakout room booking?")) return;

    try {
      const response = await fetch("http://localhost:5000/api/reservation/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          booking_id: bookingId, 
          role: "BuildingIncharge"  // Role is "BI" for Building Incharge
        }),
      });

      const result = await response.json();
      alert(result.message);
      if (result.success) {
        loadBookings(); // Refresh the list after rejection
      }
    } catch (err) {
      console.error("Reject Error:", err);
    }
  };

  // If you need an approve function (based on your PL/SQL procedures)
  const approveBooking = async (bookingId) => {
    if (!window.confirm("Approve this breakout room booking?")) return;

    try {
      const response = await fetch("http://localhost:5000/api/reservation/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          booking_id: bookingId, 
          role: "BI",
          incharge_erp: buildingInchargeERP
        }),
      });

      const result = await response.json();
      alert(result.message);
      if (result.success) {
        loadBookings();
      }
    } catch (err) {
      console.error("Approve Error:", err);
      alert("Approval failed");
    }
  };

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toISOString().substring(0, 10);
  };

  return (
    <div className="booking-admin-container">
      <div className="booking-header-row">
        <div>
          <h2 className="title">Breakout Room Reservations</h2>
          <p className="subtitle">Building Incharge View (ERP: {buildingInchargeERP})</p>
          <div className="filter-info">
            Showing {bookings.length} breakout room bookings
          </div>
        </div>
        <button className="view-all-btn" onClick={loadBookings} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="booking-card-list">
        {loading ? (
          <p className="loading-text">Loading breakout room bookings...</p>
        ) : bookings.length === 0 ? (
          <p className="no-data-text">No breakout room bookings found for your building.</p>
        ) : (
          bookings.map((b) => (
            <div key={b.BOOKING_ID} className="booking-card breakout-room-card">
              <div className="card-header">
                <div>
                  <h3 className="room-name">{b.ROOM_NAME}</h3>
                  <p className="building-name">{b.BUILDING_NAME}</p>
                </div>

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

              <div className="card-body">
              
                <p><strong>Student ERP:</strong> {b.ERP}</p>
                <p><strong>Booking ID:</strong> {b.BOOKING_ID}</p>
                <p><strong>Date:</strong> {formatDate(b.BOOKING_DATE)}</p>
                <p><strong>Time:</strong> {b.START_TIME} - {b.END_TIME}</p>
                <p><strong>Purpose:</strong> {b.PURPOSE}</p>
                {b.CAPACITY && <p><strong>Capacity:</strong> {b.CAPACITY}</p>}
                {b.ROOM_TYPE && <p><strong>Room Type:</strong> {b.ROOM_TYPE}</p>}
              </div>

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