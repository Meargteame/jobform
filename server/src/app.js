const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const questionRoutes = require('./routes/questionRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const publicRoutes = require('./routes/publicRoutes');

const app = express();

// Security headers with Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow serving uploaded files to client
  })
);

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Allow dev frontend
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Public and Auth Routes (No token required for public endpoints)
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);

// Protected Recruiter Routes
app.use('/api/jobs', jobRoutes);
app.use('/api', questionRoutes);
app.use('/api', applicationRoutes);

// 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found at ${req.originalUrl}`,
  });
});

// Global Centralized Error Handler
app.use(errorHandler);

module.exports = app;
