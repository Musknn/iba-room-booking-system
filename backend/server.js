const express = require('express');
const cors = require('cors');
//import route modules
const buildingRoutes = require('./routes/buildings');
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/booking');
const announcementsRoutes = require('./routes/announcements');
const roomRoutes = require('./routes/rooms');
const reservationRoutes = require('./routes/reservation');

//creates an express application
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
//functions that run before the routes
app.use(cors()); //this lets yourfrontend(react.js) communicate with your backend
app.use(express.json()); //

// Routes
app.use('/api/buildings', buildingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reservation', reservationRoutes);

// Test route - debugging (could be removed)
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'Backend is working!',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: ['auth', 'buildings', 'booking', 'announcements', 'rooms']
  });
});

//starts the server -> makes it listen on the selected port
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`✅ Available endpoints:`);
  console.log(`   • GET  /health`);
  console.log(`   • GET  /api/test`);
  console.log(`   • GET  /api/rooms`);
  console.log(`   • GET  /api/buildings`);
  console.log(`   • GET  /api/announcements/all`);
});