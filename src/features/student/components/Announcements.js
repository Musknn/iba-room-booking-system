import React, { useState, useEffect } from 'react';
import './Announcements.css';

const StudentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError('');

      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setError('Please login first');
        setLoading(false);
        return;
      }

      const endpoint = "http://localhost:5000/api/announcements/all";
      const response = await fetch(endpoint);
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError("Failed to load announcements");
        setLoading(false);
        return;
      }

      // Sort newest first
      const sorted = data.data.sort((a, b) => {
        const dateA = new Date(a.date_posted || a.created_date);
        const dateB = new Date(b.date_posted || b.created_date);
        return dateB - dateA;
      });

      // Normalize format
      const transformed = sorted.map((item) => ({
        id: item.announcement_id || item.ANNOUNCEMENT_ID,
        title: item.title || item.TITLE || 'No Title',
        description: item.description || item.DESCRIPTION || 'No Description',
        date: item.date_posted || item.DATE_POSTED || item.created_date,
        posted_by: item.posted_by || item.POSTED_BY || "Administration",
        building: item.building_name || item.BUILDING_NAME || "General"
      }));

      setAnnouncements(transformed);

    } catch (err) {
      setError("Unable to connect to server.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  // ----------------------------
  // UI RETURN
  // ----------------------------
  if (loading) {
    return (
      <div className="announcements-container">
        <div className="announcements-header">
          <h2>Campus Announcements</h2>
          <p>Stay updated with important notices</p>
        </div>

        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading announcements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="announcements-container">
        <div className="announcements-header">
          <h2>Campus Announcements</h2>
          <p>Stay updated with important notices</p>
        </div>

        <div className="error-state">
          <p className="error-message">{error}</p>
          <button className="retry-btn" onClick={loadAnnouncements}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="announcements-container">

      {/* ---------------- HEADER ---------------- */}
      <div className="announcements-header">
        <div>
          <h2>Campus Announcements</h2>
          <p>Stay updated with important notices and announcements</p>
        </div>

        <div className="header-actions">
          <button className="refresh-btn" onClick={loadAnnouncements}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* ---------------- LIST ONLY ---------------- */}
      <div className="announcements-list">
        {announcements.length === 0 ? (
          <div className="empty-state">
            <p>No announcements found.</p>
          </div>
        ) : (
          announcements.map((a) => (
            <div key={a.id} className="announcement-card">
              
              <div className="announcement-header">
                <h3 className="announcement-title">{a.title}</h3>
                <span className="announcement-date">{formatDate(a.date)}</span>
              </div>

              <div className="announcement-meta">
                <span><strong>Posted by:</strong> {a.posted_by}</span>
                {a.building !== "General" && (
                  <span><strong>Building:</strong> {a.building}</span>
                )}
              </div>

              <div className="announcement-content">
                <p>{a.description}</p>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default StudentAnnouncements;
