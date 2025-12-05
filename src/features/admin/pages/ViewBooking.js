import React, { useEffect, useState } from "react";
import "./ViewBooking.css";

const ViewBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/reservation/po/history");

      const result = await response.json();
      console.log("PO BOOKINGS:", result);

      if (result.success) {
        // Sort using booking_id from object
        const sorted = result.data.sort(
          (a, b) => Number(b.BOOKING_ID) - Number(a.BOOKING_ID)
        );
        setBookings(sorted);
      }
    } catch (err) {
      console.error("Error loading bookings:", err);
      alert("Server unavailable");
    } finally {
      setLoading(false);
    }
  };

  const rejectBooking = async (bookingId) => {
    if (!window.confirm("Reject this classroom booking?")) return;

    try {
      const response = await fetch("http://localhost:5000/api/reservation/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: bookingId, role: "PO" }),
      });

      const result = await response.json();
      alert(result.message);
      loadBookings();
    } catch (err) {
      console.error("Reject Error:", err);
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
          <h2 className="title">Reservation History</h2>
          <p className="subtitle">All classroom bookings (Program Office View)</p>
        </div>
        <button className="view-all-btn" onClick={loadBookings} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="booking-card-list">
        {loading ? (
          <p>Loading...</p>
        ) : bookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          bookings.map((b) => (
            <div key={b.BOOKING_ID} className="booking-card">
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
                <p><strong>Student:</strong> {b.STUDENT_NAME}</p>
                <p><strong>ERP:</strong> {b.ERP}</p>
                <p><strong>Date:</strong> {formatDate(b.BOOKING_DATE)}</p>
                <p><strong>Time:</strong> {b.START_TIME} - {b.END_TIME}</p>
                <p><strong>Purpose:</strong> {b.PURPOSE}</p>
              </div>

              {b.STATUS === "Approved" && (
                <div className="card-actions">
                  <button className="reject-btn"
                    onClick={() => rejectBooking(b.BOOKING_ID)}>
                    Reject Booking
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ViewBooking;
