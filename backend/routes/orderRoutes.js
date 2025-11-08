// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();

const {
  newOrder,
  getSingleOrder,
  myOrders,
  allOrders,
  updateOrder,
  deleteOrder,
  vendorOrders,
  clearDeliveredOrders
} = require('../controllers/orderController');

const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

// User routes
router.post('/order/new', isAuthenticatedUser, newOrder);
router.get('/order/:id', isAuthenticatedUser, getSingleOrder);
router.get('/orders/me', isAuthenticatedUser, myOrders);

// Vendor routes
router.get('/vendor/orders', isAuthenticatedUser, authorizeRoles('vendor', 'admin'), vendorOrders);
router.delete('/vendor/orders/delivered', isAuthenticatedUser, authorizeRoles('vendor', 'admin'), clearDeliveredOrders);
// Admin routes
router.get('/admin/orders', isAuthenticatedUser, authorizeRoles('admin'), allOrders);
router.put('/admin/order/:id', isAuthenticatedUser, authorizeRoles('admin', 'vendor'), updateOrder);
router.delete('/admin/order/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);

module.exports = router;
