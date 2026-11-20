import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Star,
  ShoppingCart,
  Zap,
  Store,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  X
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export const ProductDetail = ({ productId, onNavigate, initialOpenReview }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    if (initialOpenReview) {
      setReviewModalOpen(true);
    }
  }, [initialOpenReview]);

  useEffect(() => {
    if (reviewModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [reviewModalOpen]);

  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const [prodRes, revRes] = await Promise.all([
          api.getProductById(productId),
          api.getProductReviews(productId)
        ]);

        if (prodRes.success) setProduct(prodRes.product);
        if (revRes.success) setReviews(revRes.reviews || []);
      } catch (err) {
        console.warn('Failed to load product detail', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [productId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && reviewModalOpen) {
        setReviewModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [reviewModalOpen]);

  const handleAddToCart = async () => {
    setAdding(true);
    await addToCart(product._id, quantity);
    setAdding(false);
  };

  const handleBuyNow = async () => {
    setAdding(true);
    await addToCart(product._id, quantity);
    setAdding(false);
    onNavigate('checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');

    if (!user) {
      setReviewError('Please sign in to rate this product');
      return;
    }

    setReviewSubmitting(true);
    try {
      const res = await api.addReview({
        productId: product._id,
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment
      });

      if (res.success) {
        const existingIdx = reviews.findIndex((r) => r.customer?._id === user.id || r.customer === user.id);
        if (existingIdx >= 0) {
          const updated = [...reviews];
          updated[existingIdx] = res.review;
          setReviews(updated);
        } else {
          setReviews([res.review, ...reviews]);
        }
        setProduct((prev) => ({ ...prev, ratings: res.productRatings }));
        setReviewModalOpen(false);
        setNewReview({ rating: 5, title: '', comment: '' });
      } else {
        setReviewError(res.message || 'Failed to submit rating');
      }
    } catch (err) {
      setReviewError(err.message || 'Submission error');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const getRatingLabel = (val) => {
    switch (val) {
      case 5:
        return '5 Stars - Excellent';
      case 4:
        return '4 Stars - Very Good';
      case 3:
        return '3 Stars - Good';
      case 2:
        return '2 Stars - Fair';
      case 1:
        return '1 Star - Poor';
      default:
        return `${val} Stars`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-center">
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <button onClick={() => onNavigate('shop')} className="mt-4 text-indigo-600 font-bold text-sm">
          Return to Catalog
        </button>
      </div>
    );
  }

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">

        <button
          onClick={() => onNavigate('shop')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
          
          <div className="space-y-4">
            <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-100 relative group">
              <img
                src={images[selectedImage] || images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {product.compareAtPrice > product.price && (
                <span className="absolute top-4 left-4 bg-rose-600 text-white font-black text-xs px-3 py-1.5 rounded-full shadow-md">
                  SALE {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImage === idx ? 'border-indigo-600 shadow-sm' : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md font-bold">
                  {product.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">SKU: {product.sku}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 mb-3 leading-snug">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-2 mb-6">
                {(product.ratings?.count > 0 || (product.ratings?.average && Number(product.ratings.average) > 0) || reviews.length > 0) ? (
                  <>
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const calculatedAvg = product.ratings?.average || (reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0);
                        return (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(calculatedAvg)
                                ? 'fill-current'
                                : 'text-slate-300'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      {Number(product.ratings?.average || (reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0)).toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      ({product.ratings?.count || reviews.length} customer ratings)
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-slate-400 font-medium">
                    No customer ratings yet
                  </span>
                )}
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(true)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors underline"
                >
                  Rate this product
                </button>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-slate-950">
                    ${Number(product.price).toFixed(2)}
                  </span>
                  {product.compareAtPrice > product.price && (
                    <span className="text-base text-slate-400 line-through">
                      ${Number(product.compareAtPrice).toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> In Stock ({product.stock} units available)
                </div>
              </div>

              {product.vendor && (
                <div className="border border-slate-200 rounded-2xl p-4 mb-6 bg-white hover:border-indigo-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.vendor.logo || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=150&q=80'}
                        alt={product.vendor.storeName}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                          {product.vendor.storeName}
                          <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {product.vendor.description || 'Verified Marketplace Merchant'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate('shop', { vendorId: product.vendor._id })}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 shrink-0"
                    >
                      <Store className="w-3.5 h-3.5" /> Visit Store
                    </button>
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-600 leading-relaxed mb-6 whitespace-pre-line">
                {product.description}
              </p>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-2 font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-bold text-xs text-slate-900 min-w-10 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="px-3.5 py-2 font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={adding || product.stock === 0}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{adding ? 'Adding...' : 'Add to Cart'}</span>
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                disabled={adding || product.stock === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Instant Checkout</span>
              </button>
            </div>
          </div>
        </div>

        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
            <div>
              <h2 className="text-xl font-black text-slate-950">Customer Reviews & Ratings</h2>
              <p className="text-xs text-slate-500 mt-0.5">Verified purchaser feedback</p>
            </div>
            <button
              onClick={() => setReviewModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Give Rating & Review</span>
            </button>
          </div>

          <div className="space-y-6">
            {reviews.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No customer reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev._id} className="border-b border-slate-100 pb-6 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-slate-200'}`}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-xs text-slate-900">{rev.title}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-2">{rev.comment}</p>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                    <span>By {rev.customer?.name || 'Customer'}</span>
                    <span className="text-emerald-600 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {reviewModalOpen && createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-lg"
            onClick={() => setReviewModalOpen(false)}
          >
            <div
              className="bg-white rounded-3xl border border-slate-200 w-full max-w-lg shadow-floating animate-modal overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                <div>
                  <h3 className="text-lg font-black text-slate-950">Give Product Rating</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Share your feedback for {product.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 flex items-center justify-center transition-all shadow-sm focus:outline-none"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleReviewSubmit} className="p-6 space-y-4 text-xs">
                {reviewError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs">
                    {reviewError}
                  </div>
                )}

                {!user && (
                  <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 p-3 rounded-xl text-xs flex items-center justify-between">
                    <span>Sign in as a customer to post your rating.</span>
                    <button
                      type="button"
                      onClick={() => onNavigate('login')}
                      className="font-bold underline text-indigo-800 hover:text-indigo-950"
                    >
                      Sign In
                    </button>
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-700 block mb-2">Select Your Rating</label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                      {[1, 2, 3, 4, 5].map((star) => {
                        const active = (hoverRating || newReview.rating) >= star;
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewReview({ ...newReview, rating: star })}
                            onMouseEnter={() => setHoverRating(star)}
                            className="p-1 focus:outline-none transition-transform hover:scale-110"
                            aria-label={`${star} Stars`}
                          >
                            <Star
                              className={`w-7 h-7 transition-colors ${
                                active
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs font-bold text-slate-700 sm:ml-2">
                      {getRatingLabel(hoverRating || newReview.rating)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Review Headline <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Excellent build quality, highly recommended"
                    value={newReview.title}
                    onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Feedback Comments <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe what you liked or disliked about this product..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                  >
                    {reviewSubmitting ? 'Submitting...' : 'Submit Rating'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};
