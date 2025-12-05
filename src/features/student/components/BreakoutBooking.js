import React, { useState, useEffect } from "react";

const BreakoutBooking = () => {
  const [step, setStep] = useState(1);
  const [buildings, setBuildings] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);

  const [form, setForm] = useState({
    slot: "",
    date: "",
    buildingId: "",
    roomId: "",
    purpose: ""
  });

  // 🔥 FIXED: Correct ERP extraction for STUDENT (and BI)
  const savedUser = JSON.parse(localStorage.getItem("user"));
  const USER_ERP = savedUser?.erp || savedUser?.ERP || 0;

  // Time slot conversion
  const slotMap = {
    "08:30-09:45": { start: "08:30", end: "09:45" },
    "10:00-11:15": { start: "10:00", end: "11:15" },
    "11:30-12:45": { start: "11:30", end: "12:45" },
    "1:00-2:15": { start: "13:00", end: "14:15" },
    "2:30-3:45": { start: "14:30", end: "15:45" },
    "4:00-5:15": { start: "16:00", end: "17:15" },
    "5:30-6:45": { start: "17:30", end: "18:45" }
  };

  useEffect(() => {
    fetch("http://localhost:5000/api/buildings")
      .then((res) => res.json())
      .then((data) => setBuildings(data))
      .catch((err) => console.log("Buildings Error:", err));
  }, []);

  // ------------------- SEARCH BREAKOUT ROOMS -------------------
  const handleSearchRooms = async () => {
    if (!form.slot || !form.date || !form.buildingId) {
      alert("Please fill all fields");
      return;
    }

    const slot = slotMap[form.slot];
    const { start, end } = slot;

    try {
      const response = await fetch(
        `http://localhost:5000/api/booking/available-rooms?date=${form.date}&startTime=${start}&endTime=${end}&buildingId=${form.buildingId}&roomType=${"Breakout".toUpperCase()}`
      );

      const result = await response.json();

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

  // ------------------- CREATE BOOKING -------------------
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
            erp: USER_ERP,        // FIXED ✔
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
        setStep(1); // reset
      } else {
        alert(result.error || "Failed to create booking");
      }
    } catch (error) {
      console.log(error);
      alert("Error creating booking");
    }
  };

  // ------------------- UI -------------------

  // STEP 1
  if (step === 1) {
    return (
      <div>
        <h2>Add Booking (Breakout Rooms)</h2>

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

        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>

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
          Search Breakout Rooms
        </button>
      </div>
    );
  }

  // STEP 2
  if (step === 2) {
    return (
      <div>
        <button className="maroon-btn" onClick={() => setStep(1)}>
          ← Back
        </button>

        <h2>Available Breakout Rooms</h2>

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

  // STEP 3
  if (step === 3) {
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

          {/* FIXED ERP DISPLAY */}
          <p><b>ERP:</b> {USER_ERP}</p>

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

export default BreakoutBooking;
