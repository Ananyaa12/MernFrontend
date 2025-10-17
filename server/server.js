// Load environment variables
require('dotenv').config();
console.log('MONGO_URI:', process.env.MONGO_URI);

// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const petRouter = require('./Routes/PetRoute');
const AdoptFormRoute = require('./Routes/AdoptFormRoute');
const AdminRoute = require('./Routes/AdminRoute');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Mount routes
app.use(petRouter);
app.use('/form', AdoptFormRoute);
app.use('/admin', AdminRoute);

// ✅ Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('✅ Connected to MongoDB Atlas');

  const PREFERRED_PORT = parseInt(process.env.PORT, 10) || 4000;

  // Start server and if the preferred port is in use, fall back to a random free port
  function startServer(port, allowFallback = true) {
    const server = app.listen(port, () => {
      const actualPort = server.address() && server.address().port;
      console.log(`🚀 Server running on port ${actualPort}`);
    });

    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        if (allowFallback) {
          console.warn(`⚠️ Port ${port} is in use. Trying a random free port...`);
          // Try listening on port 0 (random free port) and do not allow further fallbacks
          startServer(0, false);
          return;
        }
        console.error(`❌ Port ${port} is already in use and no fallback available.`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', err);
        process.exit(1);
      }
    });

    return server;
  }

  startServer(PREFERRED_PORT, true);
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});