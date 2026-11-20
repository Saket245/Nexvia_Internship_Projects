import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  storeName: {
    type: String,
    required: [true, 'Store name is required'],
    unique: true,
    trim: true
  },
  storeSlug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    default: 'Welcome to our official store on the marketplace.'
  },
  logo: {
    type: String,
    default: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=300&q=80'
  },
  banner: {
    type: String,
    default: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'suspended'],
    default: 'approved'
  },
  commissionRate: {
    type: Number,
    default: 10,
    min: 0,
    max: 50
  },
  stripeAccountId: {
    type: String,
    default: function() {
      return `acct_${Math.random().toString(36).substring(2, 12)}`;
    }
  },
  razorpayAccountId: {
    type: String,
    default: function() {
      return `acc_${Math.random().toString(36).substring(2, 12)}`;
    }
  },
  bankDetails: {
    accountHolderName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    bankName: { type: String, default: '' },
    routingNumber: { type: String, default: '' }
  },
  rating: {
    type: Number,
    default: 5.0
  },
  ratingCount: {
    type: Number,
    default: 1
  },
  totalSales: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    default: 0
  }
}, {
  autoCreate: false,
  autoIndex: false,
  timestamps: true
});

vendorSchema.pre('save', function (next) {
  if (this.isModified('storeName') && !this.storeSlug) {
    this.storeSlug = this.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }
  next();
});

export const Vendor = mongoose.model('Vendor', vendorSchema);
