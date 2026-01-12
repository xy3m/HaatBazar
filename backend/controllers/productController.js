const Product = require('../models/productModel')
const ErrorHandler = require('../utils/errorHandler')

// Create Product
exports.createProduct = async (req, res, next) => {
  try {
    req.body.vendor = req.user._id
    const product = await Product.create(req.body)
    res.status(201).json({ success: true, product })
  } catch (err) {
    next(err)
  }
}

// Update Product
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return next(new ErrorHandler("Product not found", 404))

    // Vendor can update only own product
    if (req.user.role === 'vendor' && product.vendor.toString() !== req.user._id.toString())
      return next(new ErrorHandler("Not authorized", 403))

    Object.assign(product, req.body)
    await product.save()
    res.json({ success: true, product })
  } catch (err) {
    next(err)
  }
}

// Delete Product
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return next(new ErrorHandler("Product not found", 404))

    // Vendor can delete only own product
    if (req.user.role === 'vendor' && product.vendor.toString() !== req.user._id.toString())
      return next(new ErrorHandler("Not authorized", 403))

    await product.deleteOne()
    res.json({ success: true, message: "Product deleted" })
  } catch (err) {
    next(err)
  }
}

// Get All Products
exports.getProducts = async (req, res, next) => {
  try {
    let filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // === UPDATED THIS LINE ===
    // We .populate() the 'vendor' field and select only the 'name'
    const products = await Product.find(filter).populate('vendor', 'name');

    res.json({ success: true, products })
  } catch (err) {
    next(err)
  }
}

// Get Single Product Details
exports.getProductDetails = async (req, res, next) => {
  try {
    // === UPDATED THIS LINE ===
    const product = await Product.findById(req.params.id).populate('vendor', 'name');

    if (!product) return next(new ErrorHandler("Product not found", 404))
    res.json({ success: true, product })
  } catch (err) {
    next(err)
  }
}

// Decrease Stock On Order
exports.decreaseStockOnOrder = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return next(new ErrorHandler("Product not found", 404))

    const quantity = req.body.quantity
    if (product.stock < quantity)
      return next(new ErrorHandler("Insufficient stock", 400))

    product.stock -= quantity
    await product.save()
    res.json({ success: true, product })
  } catch (err) {
    next(err)
  }
}

// Create New Review or Update the review
exports.createProductReview = async (req, res, next) => {
  console.log(">>> createProductReview called");
  try {
    const { rating, comment, productId, orderId } = req.body;
    console.log("Request Body:", req.body);
    console.log("User:", req.user);

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    // If orderId is provided, link the review to the order
    if (orderId) {
      review.order = orderId;
    }

    const product = await Product.findById(productId);
    console.log("Product found:", product ? "Yes" : "No");

    if (!product) {
      console.log("Product not found, returning 404");
      return next(new ErrorHandler("Product not found", 404));
    }

    let isReviewed = false;

    if (orderId) {
      // 1. Order-Specifc Check: Check if THIS order was already reviewed
      isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString() && rev.order && rev.order.toString() === orderId.toString()
      );
    } else {
      // 2. Generic Check (Legacy/Dashboard): Check if user EVER reviewed it (without an order ID)
      // Note: If we want to allow Dashboard reviews to capture "any" previous review, we can just find the first one.
      // But for now, let's keep it simple: If no orderId (generic review), we update the user's *latest* review or create new if none.
      // Actually, safest fallback is: Find any review by this user.
      isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
      );
    }

    if (isReviewed) {
      console.log("Review exists, updating...");
      product.reviews.forEach((rev) => {
        // Update condition matches the Find condition above
        const matchesOrder = orderId ? (rev.order && rev.order.toString() === orderId.toString()) : true;

        if (rev.user.toString() === req.user._id.toString() && matchesOrder) {
          rev.rating = rating;
          rev.comment = comment;
          // If upgrading a legacy review to an order-linked review (unlikely but possible if logic changes), we could set rev.order here.
          // holding off on that to avoid side effects.
        }
      });
    } else {
      console.log("New review, pushing...");
      product.reviews.push(review);
      product.numOfReviews = product.reviews.length;
    }

    let avg = 0;

    product.reviews.forEach((rev) => {
      avg += rev.rating;
    });

    product.ratings = avg / product.reviews.length;

    console.log("Saving product...");
    await product.save({ validateBeforeSave: false });
    console.log("Product saved successfully");

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Error in createProductReview:", error);
    next(error);
  }
};

// Get All Reviews of a product
exports.getProductReviews = async (req, res, next) => {
  try {
    const product = await Product.findById(req.query.id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    res.status(200).json({
      success: true,
      reviews: product.reviews,
    });
  } catch (error) {
    next(error);
  }
};

// Get all products for a specific vendor (My Products)
exports.getVendorProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ vendor: req.user._id })
    res.json({ success: true, products })
  } catch (err) {
    next(err)
  }
}