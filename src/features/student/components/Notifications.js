import React, { useState, useEffect } from 'react';
import './Notifications.css'; // Import CSS for styling the notifications component

// Notifications component - displays booking notifications for a student
const Notifications = ({ studentERP }) => {
  // State to store notifications
  const [notifications, setNotifications] = useState([]);
  // Loading state for spinner while fetching data
  const [loading, setLoading] = useState(true);
  // Filter state - shows all, approved only, or rejected only notifications
  const [filter, setFilter] = useState('all');

  // useEffect to load notifications when component mounts
  useEffect(() => {
    loadNotifications();
  }, []);

  // ------------------- FETCH NOTIFICATIONS -------------------
  const loadNotifications = async () => {
    setLoading(true); // Start loading

    try {
      // Get ERP from props or fallback to localStorage
      const erp = studentERP || localStorage.getItem("erp");

      if (!erp) {
        console.error("No ERP found"); // If no ERP, stop fetching
        setLoading(false);
        return;
      }

      // Fetch booking history for student
      const response = await fetch(
        `http://localhost:5000/api/reservation/student/history?erp=${erp}`
      );

      const result = await response.json();
      console.log("BOOKINGS FOR NOTIFICATIONS:", result);

      if (result.success) {
        // Filter only approved or rejected bookings
        const notificationBookings = result.data.filter(booking => {
          const status = booking.STATUS || booking.status;
          return status === 'Approved' || status === 'Rejected';
        });

        // Sort by date (newest first)
        notificationBookings.sort((a, b) => {
          const dateA = new Date(
            a.CREATED_DATE || a.created_date || a.BOOKING_DATE || a.booking_date
          );
          const dateB = new Date(
            b.CREATED_DATE || b.created_date || b.BOOKING_DATE || b.booking_date
          );
          return dateB - dateA;
        });

        setNotifications(notificationBookings); // Save to state
      } else {
        console.error(result.error || "Failed to load notifications");
      }
    } catch (err) {
      console.error("Error loading notifications:", err);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // ------------------- UTILITY FUNCTIONS -------------------

  // Format date into readable format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time into readable format
  const formatTime = (timeString) => {
    if (!timeString) return '';
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

  // Return icon for approved or rejected status
  const getStatusIcon = (status) => {
    if (status === 'Approved') {
      return (
        <div className="status-icon approved">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
      );
    } else if (status === 'Rejected') {
      return (
        <div className="status-icon rejected">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
      );
    }
    return null;
  };

  // Safely get a field from booking data (handles objects or arrays)
  const getField = (booking, fieldName, arrayIndex) => {
    if (typeof booking === 'object' && !Array.isArray(booking)) {
      return booking[fieldName] || booking[fieldName.toLowerCase()];
    }
    return booking[arrayIndex];
  };

  // ------------------- FILTERING -------------------

  // Apply current filter to notifications
  const filteredNotifications = notifications.filter(n => {
    const status = getField(n, 'STATUS', 9) || getField(n, 'status', 9);
    if (filter === 'all') return true;
    if (filter === 'approved') return status === 'Approved';
    if (filter === 'rejected') return status === 'Rejected';
    return true;
  });

  // Count approved notifications
  const approvedCount = notifications.filter(n => {
    const status = getField(n, 'STATUS', 9) || getField(n, 'status', 9);
    return status === 'Approved';
  }).length;

  // Count rejected notifications
  const rejectedCount = notifications.filter(n => {
    const status = getField(n, 'STATUS', 9) || getField(n, 'status', 9);
    return status === 'Rejected';
  }).length;

  // ------------------- RENDER -------------------
  return (
    <div className="notifications-container">
      
      {/* Header with title, description, filter, and refresh */}
      <div className="notifications-header">
        <div className="header-left">
          <h2>Notifications</h2>
          <p>Updates on your booking requests</p>
        </div>
        <div className="header-actions">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Notifications</option>
            <option value="approved">Approved Only</option>
            <option value="rejected">Rejected Only</option>
          </select>
          <button 
            onClick={loadNotifications} 
            className="refresh-btn"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="notifications-stats">
        <div className="stat-card total">
          <span className="stat-number">{notifications.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card approved">
          <span className="stat-number">{approvedCount}</span>
          <span className="stat-label">Approved</span>
        </div>
        <div className="stat-card rejected">
          <span className="stat-number">{rejectedCount}</span>
          <span className="stat-label">Rejected</span>
        </div>
      </div>

      {/* Loading or empty state */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="no-notifications">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <h3>No notifications yet</h3>
          <p>When your booking requests are approved or rejected, you'll see updates here.</p>
        </div>
      ) : (
        /* Notification cards */
        <div className="notifications-list">
          {filteredNotifications.map((notification, index) => {
            // Extract all relevant fields safely
            const bookingId = getField(notification, 'BOOKING_ID', 0) || getField(notification, 'booking_id', 0);
            const roomName = getField(notification, 'ROOM_NAME', 3) || getField(notification, 'room_name', 3);
            const roomType = getField(notification, 'ROOM_TYPE', 4) || getField(notification, 'room_type', 4);
            const buildingName = getField(notification, 'BUILDING_NAME', 5) || getField(notification, 'building_name', 5);
            const bookingDate = getField(notification, 'BOOKING_DATE', 6) || getField(notification, 'booking_date', 6);
            const startTime = getField(notification, 'START_TIME', 7) || getField(notification, 'start_time', 7);
            const endTime = getField(notification, 'END_TIME', 8) || getField(notification, 'end_time', 8);
            const purpose = getField(notification, 'PURPOSE', 9) || getField(notification, 'purpose', 9);
            const status = getField(notification, 'STATUS', 10) || getField(notification, 'status', 10);
            const createdDate = getField(notification, 'CREATED_DATE', 11) || getField(notification, 'created_date', 11);

            return (
              <div 
                key={bookingId || index} 
                className={`notification-card ${status?.toLowerCase()}`}
              >
                {getStatusIcon(status)}

                <div className="notification-content">
                  {/* Header: Booking Request + Status */}
                  <div className="notification-header">
                    <h3 className="notification-title">Booking Request {status}</h3>
                    <span className={`status-tag ${status?.toLowerCase()}`}>{status}</span>
                  </div>

                  {/* Message for approved/rejected */}
                  <p className="notification-message">
                    {status === 'Approved' 
                      ? 'Great news! Your booking request has been approved.' 
                      : 'Unfortunately, your booking request has been rejected.'}
                  </p>

                  {/* Booking details */}
                  <div className="booking-details">
                    <div className="detail-row">
                      <span className="detail-label">Room:</span>
                      <span className="detail-value">{roomName || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Building:</span>
                      <span className="detail-value">{buildingName || 'N/A'}</span>
                    </div>
                    {roomType && (
                      <div className="detail-row">
                        <span className="detail-label">Room Type:</span>
                        <span className="detail-value room-type">{roomType}</span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="detail-label">Date:</span>
                      <span className="detail-value">{formatDate(bookingDate)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Time:</span>
                      <span className="detail-value">
                        {formatTime(startTime)} - {formatTime(endTime)}
                      </span>
                    </div>
                    {purpose && (
                      <div className="detail-row">
                        <span className="detail-label">Purpose:</span>
                        <span className="detail-value">{purpose}</span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="detail-label">Booking ID:</span>
                      <span className="detail-value">#{bookingId}</span>
                    </div>
                  </div>

                  {/* Footer: Created date */}
                  {createdDate && (
                    <div className="notification-footer">
                      <span className="notification-time">
                        Requested on: {formatDate(createdDate)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
