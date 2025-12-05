import React, { useState, useEffect } from 'react';
import './ViewAllRooms.css';

const ViewAllRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('all');
  const [selectedBuildingName, setSelectedBuildingName] = useState('All Buildings');
  const [filteredRooms, setFilteredRooms] = useState([]);

  // Load rooms and buildings from backend
  useEffect(() => {
    fetchData();
  }, []);

  // Apply filters when data changes - THIS TRIGGERS BUILDING FILTER
  useEffect(() => {
    filterRooms();
  }, [rooms, searchTerm, selectedBuilding]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching data from backend...');
      
      // Fetch rooms and buildings in parallel
      const [roomsRes, buildingsRes] = await Promise.allSettled([
        fetch('http://localhost:5000/api/rooms'),
        fetch('http://localhost:5000/api/rooms/buildings')
      ]);

      // Handle rooms response
      if (roomsRes.status === 'fulfilled' && roomsRes.value.ok) {
        const roomsData = await roomsRes.value.json();
        if (roomsData.success && Array.isArray(roomsData.data)) {
          console.log(`Loaded ${roomsData.data.length} rooms`);
          setRooms(roomsData.data);
        } else {
          console.warn('Using fallback rooms data');
          setRooms(getFallbackRooms());
        }
      } else {
        console.error('Failed to fetch rooms, using fallback');
        setRooms(getFallbackRooms());
      }

      // Handle buildings response
      if (buildingsRes.status === 'fulfilled' && buildingsRes.value.ok) {
        const buildingsData = await buildingsRes.value.json();
        if (buildingsData.success && Array.isArray(buildingsData.data)) {
          console.log(`Loaded ${buildingsData.data.length} buildings`);
          setBuildings(buildingsData.data);
        } else {
          console.warn('Using fallback buildings data');
          setBuildings(getFallbackBuildings());
        }
      } else {
        console.error('Failed to fetch buildings, using fallback');
        setBuildings(getFallbackBuildings());
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to dummy data
      setRooms(getFallbackRooms());
      setBuildings(getFallbackBuildings());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackRooms = () => [
    { room_id: 1, room_name: 'MAC-1', room_type: 'CLASSROOM', building_id: 1, building_name: 'Adamjee' },
    { room_id: 2, room_name: 'MAC-2', room_type: 'CLASSROOM', building_id: 1, building_name: 'Adamjee' },
    { room_id: 3, room_name: 'BREAKOUT-1', room_type: 'BREAKOUT', building_id: 1, building_name: 'Adamjee' },
    { room_id: 4, room_name: 'AUDITORIUM', room_type: 'CLASSROOM', building_id: 1, building_name: 'Adamjee' },
    { room_id: 5, room_name: 'MCC-9', room_type: 'CLASSROOM', building_id: 2, building_name: 'Aman CED' },
    { room_id: 6, room_name: 'MC-BREAKOUT-1', room_type: 'BREAKOUT', building_id: 2, building_name: 'Aman CED' },
    { room_id: 7, room_name: 'MTC-16', room_type: 'CLASSROOM', building_id: 3, building_name: 'Tabba' },
    { room_id: 8, room_name: 'MT-BREAKOUT-1', room_type: 'BREAKOUT', building_id: 3, building_name: 'Tabba' }
  ];

  const getFallbackBuildings = () => [
    { building_id: 1, building_name: 'Adamjee' },
    { building_id: 2, building_name: 'Aman CED' },
    { building_id: 3, building_name: 'Tabba' },
    { building_id: 4, building_name: 'Executive Center' },
    { building_id: 5, building_name: 'Sports Complex' }
  ];

  // ENHANCED BUILDING FILTER LOGIC
  const filterRooms = () => {
    let filtered = [...rooms];
    
    // ============================================
    // ENHANCED BUILDING FILTER LOGIC
    // ============================================
    if (selectedBuilding !== 'all') {
      // Convert selectedBuilding to number for comparison
      const buildingId = parseInt(selectedBuilding);
      
      // Enhanced filtering: Check both building_id and building_name
      filtered = filtered.filter(room => {
        // Option 1: Match by building_id (direct comparison)
        if (room.building_id === buildingId) {
          return true;
        }
        
        // Option 2: Match by building_name (find building by ID and compare names)
        const selectedBldg = buildings.find(b => b.building_id === buildingId);
        if (selectedBldg && room.building_name === selectedBldg.building_name) {
          return true;
        }
        
        // Option 3: Match by building_id string (as fallback)
        if (room.building_id && room.building_id.toString() === selectedBuilding) {
          return true;
        }
        
        return false;
      });
      
      // Update selected building name for display
      const selectedBldg = buildings.find(b => 
        b.building_id === buildingId || 
        b.building_id.toString() === selectedBuilding
      );
      setSelectedBuildingName(selectedBldg ? selectedBldg.building_name : 'Selected Building');
    } else {
      setSelectedBuildingName('All Buildings');
    }
    // ============================================
    
    // Filter by search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(room =>
        (room.room_name && room.room_name.toLowerCase().includes(term)) ||
        (room.building_name && room.building_name.toLowerCase().includes(term)) ||
        (room.room_type && room.room_type.toLowerCase().includes(term))
      );
    }
    
    console.log(`Filtered to ${filtered.length} rooms for building: ${selectedBuildingName}`);
    setFilteredRooms(filtered);
  };

  // Handle building selection change
  const handleBuildingChange = (e) => {
    const value = e.target.value;
    console.log(`Building selected: ${value}`);
    setSelectedBuilding(value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedBuilding('all');
    setSelectedBuildingName('All Buildings');
  };

  // Generate random availability status
  const getAvailability = () => {
    const statuses = ['available', 'occupied'];
    const randomIndex = Math.floor(Math.random() * statuses.length);
    return {
      status: statuses[randomIndex],
      text: statuses[randomIndex].toUpperCase()
    };
  };

  const formatRoomName = (roomName) => {
    if (!roomName) return 'Unknown Room';
    return roomName.replace(/_/g, ' ');
  };

  // Calculate building-specific stats
  const getBuildingStats = () => {
    if (selectedBuilding === 'all') return `All ${rooms.length} rooms`;
    
    const buildingRoomCount = rooms.filter(room => {
      const buildingId = parseInt(selectedBuilding);
      return room.building_id === buildingId || 
             (room.building_name && buildings.find(b => b.building_id === buildingId)?.building_name === room.building_name);
    }).length;
    
    return `${buildingRoomCount} rooms in ${selectedBuildingName}`;
  };

  if (loading) {
    return (
      <div className="view-all-rooms">
        <h2>University Rooms Directory</h2>
        <div className="filters-section">
          <div className="loading-placeholder">
            <div className="loading-spinner"></div>
            <p>Loading rooms data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="view-all-rooms">
      <h2>University Rooms Directory</h2>

      {/* Filters Section - WITH WORKING BUILDING FILTER */}
      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="buildingFilter">Filter by Building</label>
          <select
            id="buildingFilter"
            value={selectedBuilding}
            onChange={handleBuildingChange}
            className="filter-select"
          >
            <option value="all">All Buildings</option>
            {buildings.map((building) => (
              // FIXED: Ensure value is string and matches building_id
              <option key={building.building_id} value={building.building_id.toString()}>
                {building.building_name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="searchRoom">Search Classrooms</label>
          <input
            id="searchRoom"
            type="text"
            placeholder="Search by room name or building..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <button 
            type="button" 
            onClick={handleClearFilters}
            className="clear-btn"
            style={{
              background: '#f8f9fa',
              border: '2px solid #550707',
              color: '#550707',
              padding: '12px 20px',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Clear Filters
          </button>
        </div>

        <div className="filter-stats">
          <div style={{ fontWeight: '600', color: '#333' }}>
            {filteredRooms.length} rooms shown
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            {getBuildingStats()}
          </div>
        </div>
      </div>

      {/* Active Filter Indicator */}
      {selectedBuilding !== 'all' && (
        <div style={{
          background: '#f0f7ff',
          padding: '12px 20px',
          borderRadius: '6px',
          marginBottom: '20px',
          fontSize: '14px',
          color: '#333',
          borderLeft: '3px solid #550707',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <strong>Viewing:</strong> Rooms in <span style={{ color: '#550707', fontWeight: '600' }}>{selectedBuildingName}</span>
            {searchTerm && (
              <span> • Searching for: "<span style={{ color: '#550707', fontWeight: '600' }}>{searchTerm}</span>"</span>
            )}
          </div>
          <button
            onClick={handleClearFilters}
            style={{
              background: 'none',
              border: 'none',
              color: '#550707',
              fontSize: '13px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Rooms Grid - Shows filtered rooms based on building selection */}
      {filteredRooms.length === 0 ? (
        <div className="no-rooms-found">
          <p>No rooms found matching your criteria.</p>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '10px', marginBottom: '15px' }}>
            {selectedBuilding !== 'all' && `No rooms found in ${selectedBuildingName}`}
            {searchTerm && ` • No results for "${searchTerm}"`}
          </div>
          <button 
            onClick={handleClearFilters}
            style={{
              background: '#550707',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Clear filters to see all rooms
          </button>
        </div>
      ) : (
        <>
          <div className="rooms-grid">
            {filteredRooms.map((room) => {
              const availability = getAvailability();
              
              return (
                <div key={room.room_id} className="room-card">
                  <div>
                    <h3>{formatRoomName(room.room_name)}</h3>
                    <p><strong>Building:</strong> <span style={{ color: '#550707', fontWeight: '600' }}>{room.building_name || 'Unknown'}</span></p>
                    <p><strong>Type:</strong> {room.room_type || 'Standard'}</p>
                    <p><strong>Room ID:</strong> {room.room_id}</p>
                    
                    <div className={`availability ${availability.status}`}>
                      {availability.text}
                    </div>
                  </div>
                  
                  <div style={{ 
                    marginTop: '15px', 
                    fontSize: '12px', 
                    color: '#888',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>Building: {room.building_name}</span>
                    <span>ID: {room.room_id}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Results Summary */}
          <div style={{
            marginTop: '30px',
            padding: '15px',
            background: '#f8f9fa',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#666'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>Results:</strong> {filteredRooms.length} of {rooms.length} rooms shown
                {selectedBuilding !== 'all' && (
                  <span> • Filtered by: <span style={{ color: '#550707', fontWeight: '600' }}>{selectedBuildingName}</span></span>
                )}
              </div>
              <button 
                onClick={fetchData}
                style={{
                  background: 'none',
                  border: '1px solid #550707',
                  color: '#550707',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Refresh Data
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewAllRooms;