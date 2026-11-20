import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { getSearchEngine } from '../config/elasticsearch.js';

export const addReview = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;

    const numRating = Number(rating);
    if (!productId || isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Please provide a valid rating between 1 and 5 stars' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const ratingDescriptions = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };

    const cleanTitle = (typeof title === 'string' && title.trim())
      ? title.trim()
      : `${ratingDescriptions[numRating] || 'Customer'} Rating`;

    const cleanComment = (typeof comment === 'string' && comment.trim())
      ? comment.trim()
      : `Customer rated this product ${numRating} out of 5 stars.`;

    let review = await Review.findOne({ product: productId, customer: req.user._id });
    if (review) {
      review.rating = numRating;
      review.title = cleanTitle;
      review.comment = cleanComment;
      await review.save();
    } else {
      review = await Review.create({
        product: productId,
        customer: req.user._id,
        rating: numRating,
        title: cleanTitle,
        comment: cleanComment
      });
    }

    await review.populate('customer', 'name avatar');

    const reviews = await Review.find({ product: productId });
    const count = reviews.length;
    const avgRating = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;
    const ratings = {
      average: Math.round(avgRating * 10) / 10,
      count
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { ratings },
      { new: true }
    ).populate('vendor', 'storeName logo');

    const searchEngine = getSearchEngine();
    await searchEngine.indexDoc(productId, {
      id: updatedProduct._id.toString(),
      name: updatedProduct.name,
      description: updatedProduct.description,
      price: updatedProduct.price,
      compareAtPrice: updatedProduct.compareAtPrice,
      category: updatedProduct.category,
      brand: updatedProduct.brand,
      stock: updatedProduct.stock,
      images: updatedProduct.images,
      tags: updatedProduct.tags,
      ratings: updatedProduct.ratings,
      vendor: {
        _id: updatedProduct.vendor?._id,
        storeName: updatedProduct.vendor?.storeName
      },
      createdAt: updatedProduct.createdAt
    });

    return res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      review,
      productRatings: ratings
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
