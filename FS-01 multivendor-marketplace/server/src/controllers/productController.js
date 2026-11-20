import { Product } from '../models/Product.js';
import { Vendor } from '../models/Vendor.js';
import { uploadToS3 } from '../config/s3.js';
import { getSearchEngine } from '../config/elasticsearch.js';

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, compareAtPrice, category, brand, stock, images, tags, attributes } = req.body;

    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) {
      return res.status(403).json({ success: false, message: 'Vendor profile not found. Please onboard first.' });
    }

    const product = await Product.create({
      vendor: vendor._id,
      name,
      description,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : 0,
      category,
      brand: brand || 'Generic',
      stock: stock ? Number(stock) : 20,
      images: Array.isArray(images) && images.length ? images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'],
      tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : []),
      attributes: Array.isArray(attributes) ? attributes : [],
      ratings: { average: 0, count: 0 }
    });

    await product.populate('vendor', 'storeName logo commissionRate');

    const searchEngine = getSearchEngine();
    await searchEngine.indexDoc(product._id, {
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      brand: product.brand,
      stock: product.stock,
      images: product.images,
      tags: product.tags,
      ratings: product.ratings,
      vendor: {
        _id: vendor._id,
        storeName: vendor.storeName
      },
      createdAt: product.createdAt
    });

    return res.status(201).json({
      success: true,
      message: 'Product created and indexed successfully',
      product
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { category, brand, vendorId, minPrice, maxPrice, sortBy, page = 1, limit = 12 } = req.query;

    const query = { isPublished: true };

    if (category && category !== 'All') query.category = category;
    if (brand) query.brand = brand;
    if (vendorId) query.vendor = vendorId;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sortBy === 'price_asc') sortOption = { price: 1 };
    if (sortBy === 'price_desc') sortOption = { price: -1 };
    if (sortBy === 'rating') sortOption = { 'ratings.average': -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('vendor', 'storeName logo rating')
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query)
    ]);

    return res.json({
      success: true,
      count: products.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)) || 1,
      products
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('vendor', 'storeName logo rating totalSales description');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor || (product.vendor.toString() !== vendor._id.toString() && req.user.role !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this product' });
    }

    const { name, description, price, compareAtPrice, category, brand, stock, images, tags, isPublished } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (compareAtPrice !== undefined) product.compareAtPrice = Number(compareAtPrice);
    if (category) product.category = category;
    if (brand) product.brand = brand;
    if (stock !== undefined) product.stock = Number(stock);
    if (images) product.images = images;
    if (tags) product.tags = tags;
    if (isPublished !== undefined) product.isPublished = isPublished;

    await product.save();
    await product.populate('vendor', 'storeName logo');

    const searchEngine = getSearchEngine();
    await searchEngine.indexDoc(product._id, {
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      brand: product.brand,
      stock: product.stock,
      images: product.images,
      tags: product.tags,
      ratings: product.ratings,
      vendor: {
        _id: product.vendor._id,
        storeName: product.vendor.storeName
      },
      createdAt: product.createdAt
    });

    return res.json({ success: true, message: 'Product updated successfully', product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor || (product.vendor.toString() !== vendor._id.toString() && req.user.role !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);

    const searchEngine = getSearchEngine();
    await searchEngine.deleteDoc(req.params.id);

    return res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please provide an image file' });
    }

    const url = await uploadToS3(req.file, 'products');
    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully to S3 / storage',
      url
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
