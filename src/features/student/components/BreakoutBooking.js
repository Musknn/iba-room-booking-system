// Import React and required hooks
import React, { useState, useEffect } from "react";

// Main component for booking Breakout rooms
const BreakoutBooking = () => {

  /* ================================
     STATE MANAGEMENT
     ================================ */

  // Controls which step of the booking flow is active
  // 1 = Search form
  // 2 = Available rooms list
  // 3 = Booking confirmation modal
  const [step, setStep] = useState(1);

  // Stores list of buildings fetched from backend
  const [buildings, setBuildings] = useState([]);

  // Stores list of available breakout rooms for selected criteria
  const [availableRooms, setAvailableRooms] = useState([]);

  // Centralized form state for booking data
  const [form, setForm] = useState({
    slot: "",        // Selected time slot (e.g., "08:30-09:45")
    date: "",        // Selected booking date
    buildingId: "",  // Selected building ID
    roomId: "",      // Selected room ID
    purpose: ""      // Purpose of booking
  });

  /* ================================
     USER ERP EXTRACTION
     ================================ */

  // Retrieve logged-in user object from localStorage
  const savedUser = JSON.parse(localStorage.getItem("user"));

  // Extract ERP safely (supports different casing from backend)
  // Defaults to 0 if ERP is missing
  const USER_ERP = savedUser?.erp || savedUser?.ERP || 0;

  /* ================================
     SLOT → TIME CONVERSION
     ================================ */

  // Maps UI-friendly slots to backend-compatible start/end times
  const slotMap = {
    "08:30-09:45": { start: "08:30", end: "09:45" },
    "10:00-11:15": { start: "10:00", end: "11:15" },
    "11:30-12:45": { start: "11:30", end: "12:45" },
    "1:00-2:15":   { start: "13:00", end: "14:15" },
    "2:30-3:45":   { start: "14:30", end: "15:45" },
    "4:00-5:15":   { start: "16:00", end: "17:15" },
    "5:30-6:45":   { start: "17:30", end: "18:45" }
  };

  /* ================================
     FETCH BUILDINGS ON LOAD
     ================================ */

  // Runs once when component mounts
  useEffect(() => {
    fetch("http://localhost:5000/api/buildings")
      .then((res) => res.json())
      .then((data) => setBuildings(data)) // Save buildings in state
      .catch((err) => console.log("Buildings Error:", err));
  }, []);

  /* ================================
     SEARCH AVAILABLE BREAKOUT ROOMS
     ================================ */

  const handleSearchRooms = async () => {

    // Validate required inputs before API call
    if (!form.slot || !form.date || !form.buildingId) {
      alert("Please fill all fields");
      return;
    }

    // Convert selected slot into start/end times
    const slot = slotMap[form.slot];
    const { start, end } = slot;

    try {
      // Fetch available breakout rooms from backend
      const response = await fetch(
        `http://localhost:5000/api/booking/available-rooms?date=${form.date}&startTime=${start}&endTime=${end}&buildingId=${form.buildingId}&roomType=${"Breakout".toUpperCase()}`
      );

      const result = await response.json();

      // If rooms exist, move to Step 2
      if (result.success && result.data.length > 0) {
        setAvailableRooms(result.data);
        setStep(2);
      } else {
        alert("No breakout rooms available");
      }
    } catch (error) {
      console.log(error);
      alert("Error fetching breakout rooms");
    }
  };

  /* ================================
     CREATE BOOKING
     ================================ */

  const handleAddBooking = async () => {

    // Validate slot before submission
    const slot = slotMap[form.slot];
    if (!slot) return alert("Invalid slot");

    const { start, end } = slot;

    try {
      // Send booking request to backend
      const response = await fetch(
        "http://localhost:5000/api/booking/create-booking",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            erp: USER_ERP,                // Logged-in user's ERP
            roomId: Number(form.roomId), // Selected room ID
            date: form.date,             // Booking date
            startTime: start,             // Slot start time
            endTime: end,                 // Slot end time
            purpose: form.purpose         // Purpose entered by user
          })
        }
      );

      const result = await response.json();

      // Handle success/failure
      if (result.success) {
        alert("Booking Successfully Created!");
        setStep(1); // Reset flow after booking
      } else {
        alert(result.error || "Failed to create booking");
      }
    } catch (error) {
      console.log(error);
      alert("Error creating booking");
    }
  };

  /* ================================
     UI RENDERING
     ================================ */

  /* -------- STEP 1: SEARCH FORM -------- */
  if (step === 1) {
    return (
      <div>
        <h2>Add Booking (Breakout Rooms)</h2>

        {/* Slot selection */}
        <div className="form-group">
          <label>Slot</label>
          <select
            value={form.slot}
            onChange={(e) => setForm({ ...form, slot: e.target.value })}
            className="filter-select"
          >
            <option value="">Select Slot</option>
            {Object.keys(slotMap).map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>

        {/* Date selection */}
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>

        {/* Building selection */}
        <div className="form-group">
          <label>Building</label>
          <select
            onChange={(e) => setForm({ ...form, buildingId: e.target.value })}
          >
            <option value="">Select Building</option>
            {buildings.map((b) => (
              <option key={b.BUILDING_ID} value={b.BUILDING_ID}>
                {b.BUILDING_NAME}
              </option>
            ))}
          </select>
        </div>

        {/* Search button */}
        <button className="maroon-btn" onClick={handleSearchRooms}>
          Search Breakout Rooms
        </button>
      </div>
    );
  }

  /* -------- STEP 2: AVAILABLE ROOMS -------- */
  if (step === 2) {
    return (
      <div>
        <button className="maroon-btn" onClick={() => setStep(1)}>
          ← Back
        </button>

        <h2>Available Breakout Rooms</h2>

        {/* Grid layout for room cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
            marginTop: "20px"
          }}
        >
          {availableRooms.map((room) => (
            <div
              key={room.ROOM_ID}
              style={{
                background: "white",
                padding: "18px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
              }}
            >
              <h3>{room.ROOM_NAME}</h3>
              <p><b>Type:</b> {room.ROOM_TYPE}</p>
              <p><b>Building:</b> {room.BUILDING_NAME}</p>

              {/* Proceed to confirmation */}
              <button
                className="maroon-btn"
                style={{ width: "100%", marginTop: "10px" }}
                onClick={() => {
                  setForm({ ...form, roomId: room.ROOM_ID });
                  setStep(3);
                }}
              >
                Book Now
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* -------- STEP 3: CONFIRMATION MODAL -------- */
  if (step === 3) {

    // Find selected room details
    const selectedRoom = availableRooms.find(
      (r) => r.ROOM_ID === form.roomId
    );

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10
        }}
      >
        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "10px",
            width: "90%",
            maxWidth: "500px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.25)"
          }}
        >
          <h2>Confirm Breakout Room Booking</h2>

          <p><b>Room:</b> {selectedRoom?.ROOM_NAME}</p>
          <p><b>Building:</b> {selectedRoom?.BUILDING_NAME}</p>
          <p><b>Date:</b> {form.date}</p>
          <p><b>Slot:</b> {form.slot}</p>

          {/* Display ERP for verification */}
          <p><b>ERP:</b> {USER_ERP}</p>

          {/* Purpose input */}
          <textarea
            placeholder="Describe the purpose..."
            style={{
              width: "100%",
              height: "80px",
              marginTop: "10px",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc"
            }}
            onChange={(e) =>
              setForm({ ...form, purpose: e.target.value })
            }
          ></textarea>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button
              className="maroon-btn"
              style={{ flex: 1 }}
              onClick={handleAddBooking}
            >
              Confirm Booking
            </button>

            <button
              style={{
                flex: 1,
                background: "#555",
                color: "white",
                border: "none",
                padding: "10px",
                borderRadius: "6px"
              }}
              onClick={() => setStep(2)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }
};

// Export component
export default BreakoutBooking;
