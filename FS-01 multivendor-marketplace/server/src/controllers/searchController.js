import { getSearchEngine } from '../config/elasticsearch.js';
import { Product } from '../models/Product.js';

export const searchProducts = async (req, res) => {
  try {
    const { q, category, brand, minPrice, maxPrice, minRating, vendorId, sortBy, page = 1, limit = 12 } = req.query;

    const mongoQuery = { isPublished: true };

    if (category && category !== 'All' && category !== '') {
      mongoQuery.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }
    if (brand && brand !== '') {
      mongoQuery.brand = { $regex: new RegExp(`^${brand}$`, 'i') };
    }
    if (vendorId) {
      mongoQuery.vendor = vendorId;
    }
    if (minPrice || maxPrice) {
      mongoQuery.price = {};
      if (minPrice) mongoQuery.price.$gte = Number(minPrice);
      if (maxPrice) mongoQuery.price.$lte = Number(maxPrice);
    }
    if (minRating) {
      mongoQuery['ratings.average'] = { $gte: Number(minRating) };
    }

    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      mongoQuery.$or = [
        { name: regex },
        { description: regex },
        { brand: regex },
        { category: regex },
        { tags: regex }
      ];
    }

    let sort = { createdAt: -1 };
    if (sortBy === 'price_asc') sort = { price: 1 };
    else if (sortBy === 'price_desc') sort = { price: -1 };
    else if (sortBy === 'rating') sort = { 'ratings.average': -1, 'ratings.count': -1 };
    else if (sortBy === 'newest') sort = { createdAt: -1 };

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 12);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(mongoQuery)
        .populate('vendor', 'storeName logo rating')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(mongoQuery)
    ]);

    const facets = await Product.aggregate([
      { $match: { isPublished: true } },
      {
        $facet: {
          categories: [{ $group: { _id: '$category', count: { $sum: 1 } } }],
          brands: [{ $group: { _id: '$brand', count: { $sum: 1 } } }]
        }
      }
    ]);

    const categoriesFacet = {};
    const brandsFacet = {};
    if (facets[0]?.categories) {
      facets[0].categories.forEach(c => { if (c._id) categoriesFacet[c._id] = c.count; });
    }
    if (facets[0]?.brands) {
      facets[0].brands.forEach(b => { if (b._id) brandsFacet[b._id] = b.count; });
    }

    return res.json({
      success: true,
      hits: products,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      facets: {
        categories: categoriesFacet,
        brands: brandsFacet
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, suggestions: [] });
    }

    const regex = new RegExp(q.trim(), 'i');
    const products = await Product.find({ name: regex, isPublished: true })
      .select('name category')
      .limit(8);

    const suggestions = products.map(p => ({
      type: 'product',
      text: p.name,
      id: p._id,
      category: p.category
    }));

    return res.json({ success: true, suggestions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
