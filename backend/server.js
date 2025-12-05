const express = require('express');
const cors = require('cors');
const buildingRoutes = require('./routes/buildings');
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/booking');  // Add this line
const reservationRoutes = require('./routes/reservation');


// Add this line

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/buildings', buildingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/booking', bookingRoutes);  // Add this line
app.use('/api/reservation', reservationRoutes);



// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});