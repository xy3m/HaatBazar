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

// Get all products for a specific vendor (My Products)
exports.getVendorProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ vendor: req.user._id })
    res.json({ success: true, products })
  } catch (err) {
    next(err)
  }
}