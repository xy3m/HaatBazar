// backend/controllers/userController.js
const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");

// Get currently logged in user details => /api/v1/me
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  console.log("📢 USER PROFILE FETCHED:", JSON.stringify(user.vendorInfo, null, 2));
  res.status(200).json({
    success: true,
    user
  });
});

// Update user password => /api/v1/password/update
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check previous user password
  const isMatched = await user.comparePassword(req.body.oldPassword);

  if (!isMatched) {
    return next(new ErrorHandler('Old password is incorrect', 400));
  }

  // Note: The pre-save hook in userModel.js will hash this
  user.password = req.body.newPassword; 
  await user.save();

  sendToken(user, 200, res);
});

// Update user profile => /api/v1/me/update
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone
  };

  // We will add avatar update logic here later

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    user
  });
});

// ===================================
// Address Management (Moved from authController)
// ===================================

// Add shipping address => /api/v1/me/address
exports.addAddress = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  const newAddress = {
    name: req.body.name,
    phone: req.body.phone,
    addressLine: req.body.addressLine,
    city: req.body.city,
    division: req.body.division,
    postalCode: req.body.postalCode,
    isDefault: req.body.isDefault || false
  };

  // If this is default, set all others to non-default
  if (newAddress.isDefault) {
    user.addresses.forEach(addr => addr.isDefault = false);
  }

  user.addresses.push(newAddress);
  await user.save();

  res.status(200).json({
    success: true,
    user
  });
});

// Update shipping address => /api/v1/me/address/:addressId
exports.updateAddress = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  const addressIndex = user.addresses.findIndex(
    addr => addr._id.toString() === req.params.addressId
  );

  if (addressIndex === -1) {
    return next(new ErrorHandler('Address not found', 404));
  }

  // If setting as default, remove default from others
  if (req.body.isDefault) {
    user.addresses.forEach(addr => addr.isDefault = false);
  }

  user.addresses[addressIndex] = {
    ...user.addresses[addressIndex].toObject(),
    ...req.body
  };

  await user.save();

  res.status(200).json({
    success: true,
    user
  });
});

// Delete shipping address => /api/v1/me/address/:addressId
exports.deleteAddress = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  user.addresses = user.addresses.filter(
    addr => addr._id.toString() !== req.params.addressId
  );

  await user.save();

  res.status(200).json({
    success: true,
    user
  });
});