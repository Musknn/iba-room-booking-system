import React, { useState, useEffect } from 'react';
import './ViewAllRooms.css'; // CSS file for styling the rooms page

const ViewAllRooms = () => {
  // ===========================
  // STATE VARIABLES
  // ===========================
  const [rooms, setRooms] = useState([]); // All rooms from API
  const [buildings, setBuildings] = useState([]); // All buildings from API
  const [loading, setLoading] = useState(true); // Loading state
  const [searchTerm, setSearchTerm] = useState(''); // Search input
  const [selectedBuilding, setSelectedBuilding] = useState('all'); // Selected building filter
  const [selectedBuildingName, setSelectedBuildingName] = useState('All Buildings'); // Display name of selected building
  const [filteredRooms, setFilteredRooms] = useState([]); // Rooms after applying filters

  // ===========================
  // EFFECT HOOKS
  // ===========================
  // On component mount, load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Re-apply filters whenever rooms, searchTerm, or selectedBuilding changes
  useEffect(() => {
    applyFilters();
  }, [rooms, searchTerm, selectedBuilding]);

  // ===========================
  // LOAD INITIAL DATA
  // Fetch rooms and buildings from API
  // ===========================
  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Fetch buildings
      const buildingsRes = await fetch("http://localhost:5000/api/buildings");
      const buildingsData = await buildingsRes.json();

      console.log("Buildings API response:", buildingsData);

      // Handle different API response formats
      if (buildingsData.success && Array.isArray(buildingsData.data)) {
        setBuildings(buildingsData.data);
        console.log("Buildings set successfully:", buildingsData.data.length, "buildings");
      } else if (Array.isArray(buildingsData)) {
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
        setFilteredRooms(roomsJson.data); // Initially, all rooms are displayed
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

  // ===========================
  // FETCH ROOMS BY BUILDING NAME
  // (Used when user selects a building)
  // ===========================
  const fetchRoomsByBuilding = async (buildingName) => {
    try {
      const encodedName = encodeURIComponent(buildingName);
      const res = await fetch(`http://localhost:5000/api/rooms/building/${encodedName}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        // Normalize property names from API
        return data.data.map(room => ({
          room_id: room.ROOM_ID || room.room_id,
          room_name: room.ROOM_NAME || room.room_name,
          room_type: room.ROOM_TYPE || room.room_type,
          building_id: room.BUILDING_ID || room.building_id,
          building_name: room.BUILDING_NAME || room.building_name || buildingName
        }));
      }
    } catch (err) {
      console.error("Error fetching rooms by building:", err);
    }
    return [];
  };

  // ===========================
  // FETCH ROOMS BY SEARCH TERM
  // (Used when user searches for a room)
  // ===========================
  const fetchSearchResults = async (query) => {
    try {
      const res = await fetch(`http://localhost:5000/api/rooms/search?query=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        return data.data.map(room => ({
          room_id: room.ROOM_ID || room.room_id,
          room_name: room.ROOM_NAME || room.room_name,
          room_type: room.ROOM_TYPE || room.room_type,
          building_id: room.BUILDING_ID || room.building_id,
          building_name: room.BUILDING_NAME || room.building_name || "Unknown Building"
        }));
      }
    } catch (err) {
      console.error("Error searching rooms:", err);
    }
    return [];
  };

  // ===========================
  // APPLY FILTERS
  // Combines searchTerm + selectedBuilding filters
  // ===========================
  const applyFilters = async () => {
    let result = [];

    // CASE 1: Only search term applied
    if (searchTerm.trim() !== '' && selectedBuilding === 'all') {
      result = await fetchSearchResults(searchTerm);
    }
    // CASE 2: Only building selected
    else if (selectedBuilding !== 'all' && searchTerm.trim() === '') {
      const selectedBldg = buildings.find(b => 
        (b.building_id == selectedBuilding) || 
        (b.BUILDING_ID == selectedBuilding) ||
        (b.id == selectedBuilding)
      );
      const buildingName = selectedBldg?.building_name || selectedBldg?.BUILDING_NAME;
      if (buildingName) result = await fetchRoomsByBuilding(buildingName);
    }
    // CASE 3: Both building + search applied
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
          return roomBuildingName && roomBuildingName.toLowerCase() === buildingName.toLowerCase();
        });
      }
    }
    // CASE 4: No filters applied → show all rooms
    else {
      result = rooms;
    }

    setFilteredRooms(result);

    // Update display name for building
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

  // ===========================
  // EVENT HANDLERS
  // ===========================
  const handleBuildingChange = (e) => setSelectedBuilding(e.target.value);

  // Format room names for display
  const formatRoomName = (roomName) => {
    if (!roomName) return "Unnamed Room";
    return roomName.replace(/_/g, ' ').replace(/-/g, ' - ');
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedBuilding('all');
    setSelectedBuildingName("All Buildings");
    setFilteredRooms(rooms);
  };

  // ===========================
  // LOADING STATE
  // ===========================
  if (loading) {
    return (
      <div className="view-all-rooms">
        <h2>University Rooms Directory</h2>
        <p>Loading rooms data...</p>
      </div>
    );
  }

  // ===========================
  // MAIN UI
  // ===========================
  return (
    <div className="view-all-rooms">
      <h2>University Rooms Directory</h2>

      {/* FILTER SECTION */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>

        {/* BUILDING DROPDOWN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Filter by Building</label>
          <select 
            value={selectedBuilding} 
            onChange={handleBuildingChange}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}
          >
            <option value="all">All Buildings</option>
            {Array.isArray(buildings) && buildings.length > 0 ? (
              buildings.map((b, index) => {
                const buildingId = b.building_id || b.BUILDING_ID || b.id || index;
                const buildingName = b.building_name || b.BUILDING_NAME || b.name || `Building ${buildingId}`;
                return <option key={buildingId} value={buildingId}>{buildingName}</option>;
              })
            ) : (
              <option disabled>No buildings available</option>
            )}
          </select>
        </div>

        {/* SEARCH INPUT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Search Rooms</label>
          <input
            type="text"
            placeholder="Search by room name (e.g., 'MAC', 'AUDITORIUM')..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}
          />
        </div>

        {/* CLEAR FILTER BUTTON */}
        <button 
          onClick={handleClearFilters}
          style={{ padding: '8px 16px', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
        >
          Clear Filters
        </button>
      </div>

      {/* RESULTS INFO */}
      <div className="results-info">
        <p>
          Showing {filteredRooms.length} rooms in <strong>{selectedBuildingName}</strong>
          {searchTerm && ` matching "${searchTerm}"`}
        </p>
      </div>

      {/* ROOMS GRID */}
      <div className="rooms-grid">
        {filteredRooms.length === 0 ? (
          <div className="no-results">
            <p>No rooms found. Try changing your search criteria.</p>
          </div>
        ) : (
          filteredRooms.map((room) => (
            <div key={room.room_id} className="room-card">
              <div className="room-card-header">
                <h3>{formatRoomName(room.room_name)}</h3>
                <span className="room-type">{room.room_type}</span>
              </div>
              <div className="room-card-details">
                <p><strong>Building:</strong> {room.building_name}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ViewAllRooms;
