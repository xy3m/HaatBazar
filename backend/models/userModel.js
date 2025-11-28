const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name'],
    maxLength: [50, 'Name cannot exceed 50 characters'],
    minLength: [3, 'Name should have at least 3 characters']
  },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    unique: true,
    validate: [validator.isEmail, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Please enter your password'],
    minLength: [8, 'Password should be at least 8 characters'],
    select: false
  },
  avatar: {
    public_id: {
      type: String,
      default: 'avatars/default_avatar'
    },
    url: {
      type: String,
      default: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
    }
  },
  role: {
    type: String,
    enum: ['user', 'vendor', 'admin'],
    default: 'user'
  },
  phone: {
    type: String,
    maxLength: [15, 'Phone number cannot exceed 15 characters']
  },
  
 vendorInfo: {
  businessName: {
    type: String,
    maxLength: [100, 'Business name cannot exceed 100 characters']
  },
  businessType: {
    type: String
  },
  businessAddress: {
    type: String,
    maxLength: [500, 'Business address cannot exceed 500 characters']
  },
  taxId: {
    type: String
  },
  phoneNumber: {
    type: String,
    maxLength: [15, 'Phone number cannot exceed 15 characters']
  },
  description: {
    type: String,
    maxLength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
  isApproved: {
    type: Boolean,
    default: false
  },
  applicationDate: {
    type: Date
  },
  approvedDate: {
    type: Date
  }
},

  addresses: [{
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    addressLine: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    division: {
      type: String,
      required: true
    },
    postalCode: {
      type: String,
      required: true
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],

  resetPasswordToken: String,
  resetPasswordExpire: Date,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Generate JWT Token
userSchema.methods.getJWTToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Compare Password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate Password Reset Token
userSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
