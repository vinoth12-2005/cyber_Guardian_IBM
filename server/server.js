const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');
const db = require('./db');
const { initDatabase } = require('./db/init');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Route Imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const simulationRoutes = require('./routes/simulations');
const certificationRoutes = require('./routes/certifications');
const activityRoutes = require('./routes/activity');
const flotbotRoutes = require('./routes/flotbot');
const adminRoutes = require('./routes/admin');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// Security & Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/health', async (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: db.driver || 'unconnected',
    service: 'CyberGuardian AI Unified Backend',
    version: '1.0.0',
  });
});

app.get('/api/health', async (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: db.driver || 'unconnected',
    service: 'CyberGuardian AI Unified Backend',
    version: '1.0.0',
  });
});

// Mount Unified API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/flotbot', flotbotRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);

// Catch 404 & Global Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Server startup function
async function startServer(port = config.port) {
  try {
    console.log('[Server] Connecting to database and applying schema...');
    await initDatabase();

    const server = app.listen(port, () => {
      console.log(`====================================================`);
      console.log(`🛡️  CyberGuardian AI & FlotBot Unified Backend API`);
      console.log(`🚀 Running on: http://localhost:${port}`);
      console.log(`📊 Database Engine: ${db.driver.toUpperCase()}`);
      console.log(`📡 Environment: ${config.env}`);
      console.log(`====================================================`);
    });

    return { app, server };
  } catch (err) {
    console.error('[Server] Failed to initialize backend server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  startServer,
};
