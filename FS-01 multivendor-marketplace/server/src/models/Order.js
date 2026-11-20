import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  name: { type: String, required: true },
  image: { type: String, default: '' },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  itemTotal: { type: Number, required: true },
  vendorEarnings: { type: Number, required: true },
  platformCommission: { type: Number, required: true },
  itemStatus: {
    type: String,
    enum: ['placed', 'packed', 'shipped', 'delivered', 'cancelled'],
    default: 'placed'
  }
});

const timelineEventSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['placed', 'packed', 'shipped', 'delivered', 'cancelled'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String,
    default: ''
  }
});

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'USA' },
    phone: { type: String, default: '' }
  },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  shippingFee: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  platformTotalCommission: { type: Number, required: true },
  vendorTotalPayout: { type: Number, required: true },
  couponApplied: {
    code: { type: String },
    discountPercent: { type: Number },
    discountAmount: { type: Number }
  },
  payment: {
    gateway: {
      type: String,
      enum: ['stripe', 'razorpay', 'test_mode'],
      default: 'stripe'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'completed'
    },
    transactionId: { type: String },
    splitDetails: [{
      vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
      storeName: { type: String },
      grossSales: { type: Number },
      platformCommission: { type: Number },
      netPayout: { type: Number },
      transferId: { type: String },
      status: { type: String, default: 'transferred' }
    }]
  },
  orderStatus: {
    type: String,
    enum: ['placed', 'packed', 'shipped', 'delivered', 'cancelled'],
    default: 'placed'
  },
  timeline: [timelineEventSchema],
  invoiceNumber: {
    type: String
  }
}, {
  autoCreate: false,
  autoIndex: false,
  timestamps: true
});

export const Order = mongoose.model('Order', orderSchema);
