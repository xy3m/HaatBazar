const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter product name'],
    trim: true,
    maxLength: [200, 'Product name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please enter product description'],
    maxLength: [4000, 'Product description cannot exceed 4000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please enter product price'],
    maxLength: [8, 'Product price cannot exceed 8 digits'],
    default: 0.0
  },
  discountPrice: {
    type: Number,
    maxLength: [8, 'Discount price cannot exceed 8 digits'],
    default: 0.0
  },
  images: [{  // FIXED: Added curly brace
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }],  // FIXED: Added closing bracket
  category: {
    type: String,
    required: [true, 'Please select product category'],
    enum: {
      values: [
        'Electronics',
        'Clothing',
        'Footwear',
        'Food & Beverages',
        'Books',
        'Beauty & Personal Care',
        'Home & Kitchen',
        'Sports & Outdoors',
        'Toys & Games',
        'Automotive',
        'Health & Wellness',
        'Jewelry & Accessories',
        'Furniture',
        'Grocery',
        'Mobile & Tablets',
        'Computers',
        'Others'
      ],
      message: 'Please select correct category'
    }
  },
  subcategory: {
    type: String,
    maxLength: [100, 'Subcategory cannot exceed 100 characters']
  },
  stock: {
    type: Number,
    required: [true, 'Please enter product stock'],
    max: [99999, 'Product stock cannot exceed 5 digits'], // maxLength replaced with max for number
    default: 0,
  },
  vendor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  specifications: {
    type: Map,
    of: String
  },
  tags: [{
    type: String,
    trim: true
  }],
  isFeatured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'out-of-stock'],
    default: 'active'
  },

  ratings: {
    type: Number,
    default: 0
  },
  numOfReviews: {
    type: Number,
    default: 0
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
      },
      order: {
        type: mongoose.Schema.ObjectId,
        ref: 'Order',
        required: false
      },
      name: {
        type: String,
        required: true
      },
      rating: {
        type: Number,
        required: true
      },
      comment: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for better query performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ vendor: 1 });

module.exports = mongoose.model('Product', productSchema);
