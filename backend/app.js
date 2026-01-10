// backend/app.js - FINAL VERSION WITH CORS
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors'); // ADD THIS LINE

const app = express();

// CORS Middleware - MUST BE FIRST
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
    // Remove trailing slash if present for comparison
    const cleanOrigin = allowedOrigin.endsWith('/') ? allowedOrigin.slice(0, -1) : allowedOrigin;

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (origin === cleanOrigin) {
      callback(null, true);
    } else {
      console.log('CORS blocked:', origin); // Log blocked origins for debugging
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Other Middleware
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');

const mongoose = require('mongoose');

// Use routes
// Health check route - Must be first to bypass auth middleware
app.get('/api/v1/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  const dbState = mongoose.connection.readyState; // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting

  res.status(200).json({
    success: true,
    message: 'HaatBazar API is running',
    dbStatus,
    dbState,
    timestamp: new Date().toISOString()
  });
});

app.use('/api/v1', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1', orderRoutes);
app.use('/api/v1', vendorRoutes);
app.use('/api/v1', adminRoutes);
app.use('/api/v1', userRoutes);
// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to HaatBazar API',
    version: '1.0.0',
    documentation: 'Use Postman to test API endpoints',
    endpoints: {
      health: 'GET /api/v1/health',
      auth: 'POST /api/v1/register, /api/v1/login',
      products: 'GET /api/v1/products',
      orders: 'POST /api/v1/order/new',
      vendor: 'POST /api/v1/vendor/apply',
      admin: 'GET /api/v1/admin/stats'
    }
  });
});



// Error handling middleware (must be last)
const errorMiddleware = require('./middleware/error');
app.use(errorMiddleware);

module.exports = app;
