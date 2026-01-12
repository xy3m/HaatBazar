// backend/controllers/orderController.js
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

// --- HELPER FUNCTION: Update Stock ---
async function updateStock(productId, quantity) {
  const product = await Product.findById(productId);

  // Check if the product exists
  if (product) {
    product.stock -= quantity;

    if (product.stock <= 0) {
      product.stock = 0; // Ensure stock doesn't go negative
      product.status = 'out-of-stock';
    }

    await product.save({ validateBeforeSave: false });
  }
}

// Create new order => /api/v1/order/new
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    orderItems,
    shippingInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo
  } = req.body;

  // --- 1. VALIDATION LOOP ---
  // We check stock AND vendor ownership before creating anything
  for (const item of orderItems) {
    const product = await Product.findById(item.product);

    if (!product) {
      return next(new ErrorHandler(`Product not found: ${item.name}`, 404));
    }

    // CHECK A: Insufficient Stock
    if (product.stock < item.quantity) {
      return next(new ErrorHandler(`Insufficient stock for ${product.name}`, 400));
    }

    // CHECK B: Buying Own Product
    // We compare the product's vendor ID with the logged-in user's ID
    if (product.vendor.toString() === req.user._id.toString()) {
      return next(new ErrorHandler(`You cannot buy your own product: ${product.name}`, 400));
    }
  }

  // --- 2. CREATE ORDER ---
  const order = await Order.create({
    orderItems,
    shippingInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
    paidAt: paymentInfo.status === 'success' ? Date.now() : null,
    user: req.user._id
  });

  // --- 3. UPDATE STOCK ---
  for (const item of order.orderItems) {
    await updateStock(item.product, item.quantity);
  }

  res.status(201).json({
    success: true,
    order
  });
});

// Get single order => /api/v1/order/:id
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name price images');

  if (!order) {
    return next(new ErrorHandler('Order not found', 404));
  }

  res.status(200).json({
    success: true,
    order
  });
});

// Get logged in user orders => /api/v1/orders/me
// Get logged in user orders => /api/v1/orders/me
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id }).lean();

  // Optimized: Fetch product reviews to determine "isReviewed" status
  // 1. Collect all product IDs
  const productIds = [];
  orders.forEach(order => {
    order.orderItems.forEach(item => {
      productIds.push(item.product);
    });
  });

  // 2. Fetch products with reviews (only necessary fields)
  const products = await Product.find({ _id: { $in: productIds } }).select('reviews');

  // 3. Create a lookups: productId -> Set of reviewed Order IDs by this user
  const reviewMap = {};
  products.forEach(product => {
    // Filter reviews by this user
    const userReviews = product.reviews.filter(
      review => review.user.toString() === req.user._id.toString()
    );

    // Create a Set of Order IDs this user has reviewed for this product
    const reviewedOrderIds = new Set();
    userReviews.forEach(rev => {
      if (rev.order) {
        reviewedOrderIds.add(rev.order.toString());
      }
    });

    reviewMap[product._id.toString()] = {
      hasGenericReview: userReviews.length > 0, // Fallback if needed
      reviewedOrders: reviewedOrderIds
    };
  });

  // 4. Attach isReviewed flag to each order item
  orders.forEach(order => {
    order.orderItems.forEach(item => {
      const prodId = item.product.toString();
      const productData = reviewMap[prodId];

      if (!productData) {
        item.isReviewed = false;
      } else {
        // Strict check: Is THIS order ID in the reviewed set?
        // Note: For legacy support, if we have a generic review (no orderId), should we count it?
        // The user wants separate instances. So strictly checking Order ID is better for NEW reviews.
        // But for OLD reviews, they won't match.
        // Compromise: If check matches strict Order ID -> True.

        item.isReviewed = productData.reviewedOrders.has(order._id.toString());
      }
    });
  });

  res.status(200).json({
    success: true,
    count: orders.length,
    orders
  });
});

// Get all orders - ADMIN => /api/v1/admin/orders
exports.allOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find();

  let totalAmount = 0;
  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    count: orders.length,
    orders
  });
});

// Update order status - ADMIN/VENDOR => /api/v1/admin/order/:id
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler('Order not found', 404));
  }

  if (order.orderStatus === 'Delivered') {
    return next(new ErrorHandler('Order already delivered', 400));
  }

  // We only update the deliveredAt timestamp if status is Delivered
  if (req.body.orderStatus === 'Delivered') {
    order.deliveredAt = Date.now();
  }

  order.orderStatus = req.body.orderStatus;

  order.statusTimeline.push({
    status: req.body.orderStatus,
    timestamp: Date.now(),
    note: req.body.note || ''
  });

  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    order
  });
});

// Delete order => /api/v1/admin/order/:id
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler('Order not found', 404));
  }

  await order.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Order deleted successfully'
  });
});

// Get vendor orders => /api/v1/vendor/orders
exports.vendorOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({
    'orderItems.vendor': req.user._id
  }).populate('user', 'name email phone');

  res.status(200).json({
    success: true,
    count: orders.length,
    orders
  });
});

// Clear all DELIVERED orders for the logged-in vendor/admin
exports.clearDeliveredOrders = catchAsyncErrors(async (req, res, next) => {
  await Order.deleteMany({
    'orderItems.vendor': req.user._id,
    orderStatus: 'Delivered'
  });

  res.status(200).json({
    success: true,
    message: 'Delivered order history cleared'
  });
});