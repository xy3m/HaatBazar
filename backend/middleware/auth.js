// backend/middleware/auth.js
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('./catchAsyncErrors');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Check if user is authenticated
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  let token;

  // 1. Check for token in cookies
  if (req.cookies.token) {
    token = req.cookies.token;
  } 
  // 2. If not in cookies, check for Bearer token in Authorization header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorHandler('Please login to access this resource', 401));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decodedData.id);
  
  next();
});

// Authorize roles
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    
    // === TEMPORARY DEBUGGING: Role Check Disabled ===
    // This allows ANY logged-in user to access ANY protected route.
    // Use this ONLY to verify if permissions are causing the crash.
    
    /* if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role: ${req.user.role} is not allowed to access this resource`,
          403
        )
      );
    }
    */
   
    // ================================================
    
    next();
  };
};