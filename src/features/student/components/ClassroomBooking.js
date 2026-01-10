import React, { useState, useEffect } from "react";

/*
  ClassroomBooking Component
  ---------------------------
  Handles the complete classroom booking flow for students:
  1) Select slot, date, and building
  2) View available classrooms
  3) Confirm and create a booking
*/

const ClassroomBooking = () => {

  /* ---------------- STATE MANAGEMENT ---------------- */

  // Controls which step of the booking flow is active (1, 2, or 3)
  const [step, setStep] = useState(1);

  // Stores all buildings fetched from the backend
  const [buildings, setBuildings] = useState([]);

  // Stores rooms returned by the availability search
  const [availableRooms, setAvailableRooms] = useState([]);

  // Central form state holding user selections
  const [form, setForm] = useState({
    slot: "",        // Selected time slot (human-readable)
    date: "",        // Booking date
    buildingId: "",  // Selected building ID
    roomId: "",      // Selected room ID
    purpose: ""      // Purpose of booking
  });

  /* ---------------- USER IDENTIFICATION ---------------- */

  // Retrieve logged-in user object from localStorage
  // Supports both lowercase and uppercase ERP formats
  const savedUser = JSON.parse(localStorage.getItem("user"));
  const USER_ERP = savedUser?.erp || savedUser?.ERP || 0;

  /* ---------------- SLOT → TIME CONVERSION ---------------- */

  /*
    slotMap converts user-facing slot labels
    into backend-compatible start and end times
  */
  const slotMap = {
    "08:30-09:45": { start: "08:30", end: "09:45" },
    "10:00-11:15": { start: "10:00", end: "11:15" },
    "11:30-12:45": { start: "11:30", end: "12:45" },
    "1:00-2:15":   { start: "13:00", end: "14:15" },
    "2:30-3:45":   { start: "14:30", end: "15:45" },
    "4:00-5:15":   { start: "16:00", end: "17:15" },
    "5:30-6:45":   { start: "17:30", end: "18:45" }
  };

  /* ---------------- FETCH BUILDINGS ON LOAD ---------------- */

  // Runs once when component mounts
  useEffect(() => {
    fetch("http://localhost:5000/api/buildings")
      .then((res) => res.json())
      .then((data) => setBuildings(data))
      .catch((err) => console.log("Buildings Error:", err));
  }, []);

  /* ---------------- SEARCH AVAILABLE ROOMS ---------------- */

  /*
    Validates form input
    Converts slot to start/end time
    Calls backend API to fetch available classrooms
  */
  const handleSearchRooms = async () => {

    // Ensure all required fields are selected
    if (!form.slot || !form.date || !form.buildingId) {
      alert("Please fill all fields");
      return;
    }

    // Convert selected slot to backend time format
    const slot = slotMap[form.slot];
    const { start, end } = slot;

    try {
      const response = await fetch(
        `http://localhost:5000/api/booking/available-rooms?date=${form.date}&startTime=${start}&endTime=${end}&buildingId=${form.buildingId}&roomType=${"Classroom".toUpperCase()}`
      );

      const result = await response.json();

      // If rooms are found, move to Step 2
      if (result.success && result.data.length > 0) {
        setAvailableRooms(result.data);
        setStep(2);
      } else {
        alert("No rooms available");
      }
    } catch (error) {
      console.log(error);
      alert("Error fetching available rooms");
    }
  };

  /* ---------------- CREATE BOOKING ---------------- */

  /*
    Sends booking details to backend
    Uses ERP, roomId, date, time range, and purpose
  */
  const handleAddBooking = async () => {

    const slot = slotMap[form.slot];
    if (!slot) return alert("Invalid slot");

    const { start, end } = slot;

    try {
      const response = await fetch(
        "http://localhost:5000/api/booking/create-booking",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            erp: USER_ERP,          // Logged-in student ERP
            roomId: Number(form.roomId),
            date: form.date,
            startTime: start,
            endTime: end,
            purpose: form.purpose
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        alert("Booking Successfully Created!");
        setStep(1); // Reset flow to initial step
      } else {
        alert(result.error || "Failed to create booking");
      }
    } catch (error) {
      console.log(error);
      alert("Error creating booking");
    }
  };

  /* ======================= UI RENDERING ======================= */

  /* ---------------- STEP 1: INPUT FORM ---------------- */
  if (step === 1) {
    return (
      <div>
        <h2>Add Booking</h2>

        {/* Slot Selection */}
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

        {/* Date Selection */}
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>

        {/* Building Selection */}
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

        <button className="maroon-btn" onClick={handleSearchRooms}>
          Search Available Rooms
        </button>
      </div>
    );
  }

  /* ---------------- STEP 2: AVAILABLE ROOMS GRID ---------------- */
  if (step === 2) {
    return (
      <div>
        <button className="maroon-btn" onClick={() => setStep(1)}>
          ← Back
        </button>

        <h2>Available Rooms</h2>

        {/* Grid of available rooms */}
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
              <h3 style={{ margin: "0 0 6px" }}>{room.ROOM_NAME}</h3>
              <p><b>Type:</b> {room.ROOM_TYPE}</p>
              <p><b>Building:</b> {room.BUILDING_NAME}</p>

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

  /* ---------------- STEP 3: CONFIRMATION MODAL ---------------- */
  if (step === 3) {

    // Find the selected room details
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
          <h2>Confirm Booking</h2>

          <p><b>Room:</b> {selectedRoom?.ROOM_NAME}</p>
          <p><b>Building:</b> {selectedRoom?.BUILDING_NAME}</p>
          <p><b>Date:</b> {form.date}</p>
          <p><b>Time:</b> {form.slot}</p>

          {/* ERP shown for verification */}
          <p><b>ERP:</b> {USER_ERP}</p>

          {/* Purpose Input */}
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

export default ClassroomBooking;
