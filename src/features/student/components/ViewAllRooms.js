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

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [rooms, searchTerm, selectedBuilding]);

  // ----------------------------------------------
  // LOAD INITIAL DATA - FIXED to handle API response properly
  // ----------------------------------------------
  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Fetch buildings
      const buildingsRes = await fetch("http://localhost:5000/api/buildings");
      const buildingsData = await buildingsRes.json();
      
      console.log("Buildings API response:", buildingsData);
      
      // The API returns {success: true, data: [...]}
      // Check both possible response formats
      if (buildingsData.success && Array.isArray(buildingsData.data)) {
        setBuildings(buildingsData.data);
        console.log("Buildings set successfully:", buildingsData.data.length, "buildings");
      } else if (Array.isArray(buildingsData)) {
        // Fallback: direct array response
        setBuildings(buildingsData);
        console.log("Buildings set (direct array):", buildingsData.length, "buildings");
      } else {
        console.error("Unexpected buildings API format:", buildingsData);
        setBuildings([]);
      }

      // Fetch rooms
      const roomsRes = await fetch("http://localhost:5000/api/rooms");
      const roomsJson = await roomsRes.json();
      
      if (roomsJson.success && Array.isArray(roomsJson.data)) {
        setRooms(roomsJson.data);
        setFilteredRooms(roomsJson.data);
        console.log("Rooms loaded:", roomsJson.data.length, "rooms");
      } else {
        console.error("Unexpected rooms API format:", roomsJson);
        setRooms([]);
        setFilteredRooms([]);
      }

    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------
  // CALL PROCEDURE: getRoomsByBuilding (by NAME)
  // ----------------------------------------------
  const fetchRoomsByBuilding = async (buildingName) => {
    try {
      const encodedName = encodeURIComponent(buildingName);
      const res = await fetch(`http://localhost:5000/api/rooms/building/${encodedName}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        return data.data.map(room => ({
          room_id: room.ROOM_ID || room.room_id || room.ROOM_ID,
          room_name: room.ROOM_NAME || room.room_name || room.ROOM_NAME,
          room_type: room.ROOM_TYPE || room.room_type || room.ROOM_TYPE,
          building_id: room.BUILDING_ID || room.building_id || room.BUILDING_ID,
          building_name: room.BUILDING_NAME || room.building_name || room.BUILDING_NAME || buildingName
        }));
      }
    } catch (err) {
      console.error("Error fetching rooms by building:", err);
    }
    return [];
  };

  // ----------------------------------------------
  // CALL PROCEDURE: searchByRoom
  // ----------------------------------------------
  const fetchSearchResults = async (query) => {
    try {
      const res = await fetch(`http://localhost:5000/api/rooms/search?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        return data.data.map(room => ({
          room_id: room.ROOM_ID || room.room_id || room.ROOM_ID,
          room_name: room.ROOM_NAME || room.room_name || room.ROOM_NAME,
          room_type: room.ROOM_TYPE || room.room_type || room.ROOM_TYPE,
          building_id: room.BUILDING_ID || room.building_id || room.BUILDING_ID,
          building_name: room.BUILDING_NAME || room.building_name || room.BUILDING_NAME || "Unknown Building"
        }));
      }
    } catch (err) {
      console.error("Error searching rooms:", err);
    }
    return [];
  };

  // ----------------------------------------------
  // APPLY FILTERS USING ALL 3 PROCEDURES
  // ----------------------------------------------
  const applyFilters = async () => {
    let result = [];

    // Case 1 → Search only (searchByRoom)
    if (searchTerm.trim() !== '' && selectedBuilding === 'all') {
      result = await fetchSearchResults(searchTerm);
    }

    // Case 2 → Building only (getRoomsByBuilding by NAME)
    else if (selectedBuilding !== 'all' && searchTerm.trim() === '') {
      // Find building name from building ID
      const selectedBldg = buildings.find(b => 
        (b.building_id == selectedBuilding) || 
        (b.BUILDING_ID == selectedBuilding) ||
        (b.id == selectedBuilding)
      );
      
      const buildingName = selectedBldg?.building_name || selectedBldg?.BUILDING_NAME;
      
      if (buildingName) {
        console.log("Fetching rooms for building:", buildingName);
        result = await fetchRoomsByBuilding(buildingName);
      } else if (selectedBldg) {
        // Fallback: use building name property
        const buildingNameAlt = selectedBldg.name || selectedBldg.NAME || selectedBldg.BUILDING;
        if (buildingNameAlt) {
          result = await fetchRoomsByBuilding(buildingNameAlt);
        }
      }
    }

    // Case 3 → BOTH building + search active
    else if (selectedBuilding !== 'all' && searchTerm.trim() !== '') {
      const searchResults = await fetchSearchResults(searchTerm);
      const selectedBldg = buildings.find(b => 
        (b.building_id == selectedBuilding) || 
        (b.BUILDING_ID == selectedBuilding) ||
        (b.id == selectedBuilding)
      );
      
      const buildingName = selectedBldg?.building_name || selectedBldg?.BUILDING_NAME;
      
      if (buildingName) {
        result = searchResults.filter(r => {
          const roomBuildingName = r.building_name || r.BUILDING_NAME;
          return roomBuildingName && 
            roomBuildingName.toLowerCase() === buildingName.toLowerCase();
        });
      }
    }

    // Case 4 → No search, no building filter → return all rooms
    else {
      result = rooms;
    }

    setFilteredRooms(result);

    // Update displayed building name
    if (selectedBuilding !== "all") {
      const selectedB = buildings.find(b => 
        (b.building_id == selectedBuilding) || 
        (b.BUILDING_ID == selectedBuilding) ||
        (b.id == selectedBuilding)
      );
      
      const bldgName = selectedB?.building_name || selectedB?.BUILDING_NAME || selectedB?.name || "Building";
      setSelectedBuildingName(bldgName);
    } else {
      setSelectedBuildingName("All Buildings");
    }
  };

  // ----------------------------------------------
  const handleBuildingChange = (e) => {
    setSelectedBuilding(e.target.value);
  };

  const formatRoomName = (roomName) => {
    if (!roomName) return "Unnamed Room";
    return roomName.replace(/_/g, ' ').replace(/-/g, ' - ');
  };

  const getAvailability = () => {
    const statuses = ["available", "occupied"];
    const rand = statuses[Math.floor(Math.random() * statuses.length)];
    return { status: rand, text: rand.toUpperCase() };
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedBuilding('all');
    setSelectedBuildingName("All Buildings");
    setFilteredRooms(rooms);
  };

  // ----------------------------------------------
  // UI - ONLY FILTER SECTION STRUCTURE CHANGED
  // ----------------------------------------------
  if (loading) {
    return (
      <div className="view-all-rooms">
        <h2>University Rooms Directory</h2>
        <p>Loading rooms data...</p>
      </div>
    );
  }

  return (
    <div className="view-all-rooms">
      <h2>University Rooms Directory</h2>

      {/* FILTER SECTION - STRUCTURE ALIGNED WITH CLASSROOMBOOKING */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        marginBottom: '20px'
      }}>
        {/* BUILDING DROPDOWN - MATCHING CLASSROOMBOOKING STRUCTURE */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '5px'
        }}>
          <label style={{
            fontWeight: 'bold',
            fontSize: '14px'
          }}>Filter by Building</label>
          <select 
            value={selectedBuilding} 
            onChange={handleBuildingChange}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px'
            }}
          >
            <option value="all">All Buildings</option>
            {Array.isArray(buildings) && buildings.length > 0 ? (
              buildings.map((b, index) => {
                // Extract building ID and name with multiple fallbacks
                const buildingId = b.building_id || b.BUILDING_ID || b.id || index;
                const buildingName = b.building_name || b.BUILDING_NAME || b.name || `Building ${buildingId}`;
                
                return (
                  <option key={buildingId} value={buildingId}>
                    {buildingName}
                  </option>
                );
              })
            ) : (
              <option disabled>No buildings available</option>
            )}
          </select>
        </div>

        {/* SEARCH INPUT - MATCHING STRUCTURE */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '5px'
        }}>
          <label style={{
            fontWeight: 'bold',
            fontSize: '14px'
          }}>Search Rooms</label>
          <input
            type="text"
            placeholder="Search by room name (e.g., 'MAC', 'AUDITORIUM')..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px'
            }}
          />
        </div>

        {/* CLEAR BUTTON - MATCHING STYLE */}
        <button 
          onClick={handleClearFilters}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Results Info */}
      <div className="results-info">
        <p>
          Showing {filteredRooms.length} rooms in <strong>{selectedBuildingName}</strong>
          {searchTerm && ` matching "${searchTerm}"`}
        </p>
      </div>

      {/* Rooms Grid - FIXED to handle property name variations */}
      <div className="rooms-grid">
        {filteredRooms.length === 0 ? (
          <div className="no-results">
            <p>No rooms found. Try changing your search criteria.</p>
          </div>
        ) : (
          filteredRooms.map((room) => {
            return (
              <div key={room.room_id} className="room-card">
                <div className="room-card-header">
                  <h3>{formatRoomName(room.room_name)}</h3>
                  <span className="room-type">{room.room_type}</span>
                </div>
                
                <div className="room-card-details">
                  <p><strong>Building:</strong> {room.building_name}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ViewAllRooms;