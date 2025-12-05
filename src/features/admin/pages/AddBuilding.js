import React, { useState, useEffect } from "react";

const AddBuilding = () => {
  const [buildings, setBuildings] = useState([]);
  const [form, setForm] = useState({
    name: "",
    inchargeName: "",
    inchargeEmail: "",
    inchargeERP: "",
    inchargePhone: ""
  });

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    const res = await fetch("http://localhost:5000/api/buildings");
    const data = await res.json();
    setBuildings(data);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const res = await fetch("http://localhost:5000/api/buildings/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      building_name: form.name,
      incharge_erp: parseInt(form.inchargeERP),
      incharge_name: form.inchargeName,
      incharge_email: form.inchargeEmail,
      phone_number: form.inchargePhone
    }),
  });

  const result = await res.json();
  alert(result.message);

  if (res.ok) {
    setForm({
      name: "",
      inchargeName: "",
      inchargeEmail: "",
      inchargeERP: "",
      inchargePhone: ""
    });
    fetchBuildings();
  }
};

  return (
    <div>
      <h2>Add Building</h2>
      <form onSubmit={handleSubmit} className="form-section">

        <div className="form-group">
          <label>Building Name *</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="form-row">

          <div className="form-group">
            <label>Incharge Name *</label>
            <input
              required
              value={form.inchargeName}
              onChange={(e) => setForm({ ...form, inchargeName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Incharge ERP *</label>
            <input
              required
              type="number"
              value={form.inchargeERP}
              onChange={(e) => setForm({ ...form, inchargeERP: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              required
              type="text"
              value={form.inchargePhone}
              onChange={(e) => setForm({ ...form, inchargePhone: e.target.value })}
            />
          </div>

        </div>

        <div className="form-group">
          <label>Email *</label>
          <input
            required
            type="email"
            value={form.inchargeEmail}
            onChange={(e) => setForm({ ...form, inchargeEmail: e.target.value })}
          />
        </div>

        <button className="maroon-btn">Add Building</button>
      </form>

      <br />
      <h3>Existing Buildings</h3>

      {buildings.map((b) => (
        <div key={b.BUILDING_ID} className="data-item">
          <b>{b.BUILDING_NAME}</b> — ID: {b.BUILDING_ID}
        </div>
      ))}
    </div>
  );
};

export default AddBuilding;
