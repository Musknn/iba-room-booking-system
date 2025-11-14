import React, { useState } from 'react';

const BuildingIncharge = ({ onLogout, userRole }) => {
  const [activeTab, setActiveTab] = useState('room-availability');

  // Feature buttons data
  const features = [
    {
      id: 'room-availability',
      title: 'Manage Room Availability',
      description: 'Update room status and availability schedules',
      icon: ''
    },
    {
      id: 'building-usage',
      title: 'Monitor Building Usage',
      description: 'View real-time building occupancy and usage statistics',
      icon: ''
    },
    {
      id: 'maintenance',
      title: 'Handle Maintenance Requests',
      description: 'Manage maintenance issues and repair requests',
      icon: ''
    },
    {
      id: 'reports',
      title: 'Generate Building Reports',
      description: 'Create usage reports and analytics',
      icon: ''
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          background: 'white', 
          padding: '25px', 
          borderRadius: '10px',
          marginBottom: '25px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          borderLeft: '5px solid #800000',
                  }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#800000', margin: 0 }}>
                Building Incharge Dashboard
              </h1>
              <p style={{ color: '#666', margin: '5px 0 0 0' }}>
                Manage building operations and daily activities
              </p>
            </div>
            <button 
              onClick={onLogout}
              style={{
                background:' #800000',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Feature Buttons Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {features.map(feature => (
            <button
              key={feature.id}
              onClick={() => setActiveTab(feature.id)}
              style={{
                background: activeTab === feature.id ? '#800000' : 'white',
                color: activeTab === feature.id ? 'white' : '#333',
                padding: '25px 20px',
                border: `2px solid ${activeTab === feature.id ? '#800000' : '#e0e0e0'}`,
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'left'
              }}
              onMouseOver={(e) => {
                if (activeTab !== feature.id) {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                }
              }}
              onMouseOut={(e) => {
                if (activeTab !== feature.id) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>
                {feature.icon}
              </div>
              <h3 style={{ 
                fontSize: '1.3rem', 
                fontWeight: 'bold', 
                marginBottom: '10px' 
              }}>
                {feature.title}
              </h3>
              <p style={{ 
                fontSize: '0.9rem', 
                opacity: activeTab === feature.id ? 0.9 : 0.7,
                lineHeight: '1.4'
              }}>
                {feature.description}
              </p>
            </button>
          ))}
        </div>

        {/* Feature Content Area */}
        <div style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          minHeight: '400px'
        }}>
          {activeTab === 'room-availability' && (
            <div>
              <h2 style={{ color: '#800000', marginBottom: '20px' }}>Manage Room Availability</h2>
              <p>Room availability management content coming soon...</p>
            </div>
          )}
          
          {activeTab === 'building-usage' && (
            <div>
              <h2 style={{ color: '#800000', marginBottom: '20px' }}>Monitor Building Usage</h2>
              <p>Building usage monitoring content coming soon...</p>
            </div>
          )}
          
          {activeTab === 'maintenance' && (
            <div>
              <h2 style={{ color: '#800000', marginBottom: '20px' }}>Handle Maintenance Requests</h2>
              <p>Maintenance requests management content coming soon...</p>
            </div>
          )}
          
          {activeTab === 'reports' && (
            <div>
              <h2 style={{ color: '#800000', marginBottom: '20px' }}>Generate Building Reports</h2>
              <p>Report generation content coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuildingIncharge;