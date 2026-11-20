import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    index: true
  },
  slug: {
    type: String,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: 0,
    index: true
  },
  compareAtPrice: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    index: true
  },
  brand: {
    type: String,
    default: 'Generic',
    index: true
  },
  sku: {
    type: String,
    default: function() {
      return `SKU-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    }
  },
  stock: {
    type: Number,
    required: [true, 'Stock count is required'],
    min: 0,
    default: 20
  },
  images: [{
    type: String
  }],
  tags: [{
    type: String
  }],
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  attributes: [{
    name: { type: String },
    value: { type: String }
  }]
}, {
  autoCreate: false,
  autoIndex: false,
  timestamps: true
});

productSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = `${this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}-${Date.now().toString().slice(-4)}`;
  }
  next();
});

productSchema.index({ name: 'text', description: 'text', tags: 'text' });

export const Product = mongoose.model('Product', productSchema);
