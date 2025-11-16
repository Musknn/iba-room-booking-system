import React from 'react';
import './Announcements.css';

const Announcements = () => {
  const announcements = [
    { 
      id: 1, 
      title: 'Library Extended Hours', 
      date: '2024-01-15', 
      content: 'The main library will remain open until 10 PM during finals week. Study rooms are available for group sessions.' 
    },
    { 
      id: 2, 
      title: 'Room Maintenance Schedule', 
      date: '2024-01-10', 
      content: 'Building A rooms will be under maintenance this weekend. Please plan your bookings accordingly.' 
    },
    { 
      id: 3, 
      title: 'New Room Booking Policy', 
      date: '2024-01-05', 
      content: 'Students can now book rooms up to 7 days in advance. Maximum booking duration is 3 hours per session.' 
    },
  ];

  return (
    <div className="announcements">
      <h2>University Announcements</h2>
      <div className="announcements-list">
        {announcements.map(announcement => (
          <div key={announcement.id} className="announcement-card">
            <h3>{announcement.title}</h3>
            <span className="announcement-date">{announcement.date}</span>
            <p>{announcement.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;