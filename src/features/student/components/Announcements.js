import React, { useState, useEffect } from 'react';
import './Announcements.css';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('all');
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);

  // Fetch all announcements and buildings
  useEffect(() => {
    fetchAnnouncements();
    fetchBuildings();
  }, []);

  // Filter announcements when selectedBuilding changes
  useEffect(() => {
    if (selectedBuilding === 'all') {
      setFilteredAnnouncements(announcements);
    } else {
      const filtered = announcements.filter(ann => 
        ann.building_name === selectedBuilding
      );
      setFilteredAnnouncements(filtered);
    }
  }, [selectedBuilding, announcements]);

  // CORRECTED: Properly handle UPPERCASE from Oracle
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      console.log('📢 Fetching announcements...');
      
      const response = await fetch('http://localhost:5000/api/announcements/all');
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🔍 API Response:', data);
      
      if (data.success && data.data && Array.isArray(data.data)) {
        console.log(`✅ Found ${data.data.length} announcements`);
        
        // DEBUG: Show what we actually received
        console.log('🔍 Data sample (first item):', data.data[0]);
        console.log('🔍 Data keys:', Object.keys(data.data[0]));
        
        // IMPORTANT: Oracle returns UPPERCASE keys, convert to lowercase
        const transformedData = data.data.map(item => {
          return {
            announcement_id: item.ANNOUNCEMENT_ID,
            title: item.TITLE,
            description: item.DESCRIPTION,
            date_posted: item.DATE_POSTED,
            posted_by: item.POSTED_BY,
            building_name: item.BUILDING_NAME
          };
        });
        
        console.log('✅ Transformed data (first item):', transformedData[0]);
        
        setAnnouncements(transformedData);
        setFilteredAnnouncements(transformedData);
      } else {
        console.error('❌ Invalid data structure:', data);
        setError('Failed to fetch announcements: Invalid data format');
      }
    } catch (err) {
      console.error('❌ Error fetching announcements:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch buildings
  const fetchBuildings = async () => {
    try {
      console.log('🏛️ Fetching buildings...');
      
      const response = await fetch('http://localhost:5000/api/buildings');
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🔍 Buildings response:', data);
      
      // Extract buildings array
      let buildingsArray = [];
      
      if (Array.isArray(data)) {
        buildingsArray = data;
      } else if (data && data.data && Array.isArray(data.data)) {
        buildingsArray = data.data;
      } else if (data && data.success && data.data && Array.isArray(data.data)) {
        buildingsArray = data.data;
      }
      
      console.log('🔍 Extracted buildings:', buildingsArray);
      
      // Transform buildings data
      const cleanedBuildings = buildingsArray.map(b => {
        // Handle UPPERCASE keys
        return {
          building_id: b.BUILDING_ID || b.building_id || b.ID || b.id || 0,
          building_name: (b.BUILDING_NAME || b.building_name || b.NAME || b.name || '').trim()
        };
      }).filter(b => b.building_name !== '');
      
      console.log('✅ Cleaned buildings:', cleanedBuildings);
      
      if (cleanedBuildings.length === 0) {
        // Use defaults
        setBuildings([
          { building_id: 1, building_name: 'Adamjee' },
          { building_id: 2, building_name: 'Aman CED' },
          { building_id: 3, building_name: 'Tabba' },
          { building_id: 4, building_name: 'Executive Center' },
          { building_id: 5, building_name: 'Sports Complex' }
        ]);
      } else {
        setBuildings(cleanedBuildings);
      }
      
    } catch (err) {
      console.error('❌ Error fetching buildings:', err);
      setBuildings([
        { building_id: 1, building_name: 'Adamjee' },
        { building_id: 2, building_name: 'Aman CED' },
        { building_id: 3, building_name: 'Tabba' },
        { building_id: 4, building_name: 'Executive Center' },
        { building_id: 5, building_name: 'Sports Complex' }
      ]);
    }
  };

  // Handle building filter - LOCAL FILTERING ONLY
  const handleFilterByBuilding = (buildingName) => {
    console.log('🏢 Filtering by building:', buildingName);
    setSelectedBuilding(buildingName);
    
    if (buildingName === 'all') {
      setFilteredAnnouncements(announcements);
    } else {
      const filtered = announcements.filter(ann => 
        ann.building_name === buildingName
      );
      console.log(`✅ Found ${filtered.length} announcements for ${buildingName}`);
      setFilteredAnnouncements(filtered);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Date error';
    }
  };

  if (loading) {
    return (
      <div className="announcements">
        <h2>University Announcements</h2>
        <div className="loading">Loading announcements...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="announcements">
        <h2>University Announcements</h2>
        <div className="error-message">{error}</div>
        <button onClick={fetchAnnouncements} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="announcements">
      <div className="announcements-header">
        <div>
          <h2>University Announcements</h2>
          <p>Latest university updates and notices</p>
        </div>
        
        <div className="filter-section">
          <label htmlFor="buildingFilter">Filter by Building:</label>
          <select
            id="buildingFilter"
            value={selectedBuilding}
            onChange={(e) => handleFilterByBuilding(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Buildings</option>
            {buildings.map(building => (
              <option key={building.building_id} value={building.building_name}>
                {building.building_name}
              </option>
            ))}
          </select>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            {buildings.length} building(s) available
          </div>
        </div>
      </div>

      <div className="filter-info">
        {selectedBuilding !== 'all' && (
          <p>
            Showing announcements for: <strong>{selectedBuilding}</strong>
            <button 
              onClick={() => handleFilterByBuilding('all')}
              className="clear-filter-btn"
            >
              Clear Filter
            </button>
          </p>
        )}
      </div>

      {/* Status info */}
      <div style={{ 
        background: '#e8f5e9', 
        padding: '10px', 
        margin: '15px 0',
        borderRadius: '5px',
        fontSize: '14px'
      }}>
        <div><strong>Total Announcements:</strong> {announcements.length}</div>
        <div><strong>Currently Showing:</strong> {filteredAnnouncements.length} announcement(s) for "{selectedBuilding}"</div>
        {selectedBuilding !== 'all' && filteredAnnouncements.length === 0 && (
          <div style={{ color: '#d32f2f', marginTop: '5px' }}>
            No announcements found for this building. Try selecting "All Buildings".
          </div>
        )}
      </div>

      <div className="announcements-list">
        {filteredAnnouncements.length === 0 ? (
          <div className="no-announcements">
            <p>No announcements found{selectedBuilding !== 'all' ? ` for ${selectedBuilding}` : ''}.</p>
          </div>
        ) : (
          filteredAnnouncements.map(announcement => (
            <div key={announcement.announcement_id} className="announcement-card">
              <div className="announcement-header">
                <h3>{announcement.title}</h3>
                <span className="announcement-date">
                  {formatDate(announcement.date_posted)}
                </span>
              </div>
              
              <div className="announcement-meta">
                <span className="posted-by">
                  Posted by: <strong>{announcement.posted_by}</strong>
                </span>
                {announcement.building_name && (
                  <span className="building">
                    Building: <strong>{announcement.building_name}</strong>
                  </span>
                )}
              </div>
              
              <p className="announcement-content">
                {announcement.description}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Announcements;