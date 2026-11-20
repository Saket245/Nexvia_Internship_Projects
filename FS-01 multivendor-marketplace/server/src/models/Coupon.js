import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  discountPercent: {
    type: Number,
    required: true,
    min: 1,
    max: 90
  },
  maxDiscount: {
    type: Number,
    default: 100
  },
  minOrderAmount: {
    type: Number,
    default: 0
  },
  expiryDate: {
    type: Date,
    default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageLimit: {
    type: Number,
    default: 1000
  },
  timesUsed: {
    type: Number,
    default: 0
  }
}, {
  autoCreate: false,
  autoIndex: false,
  timestamps: true
});

export const Coupon = mongoose.model('Coupon', couponSchema);
