import React, { useState } from 'react';
import { Star, ShoppingCart, Check, Store } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';

export const ProductCard = ({ product, onNavigate }) => {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const discountPercent = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    setAdding(true);
    await addToCart(product._id || product.id, 1);
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div
      onClick={() => onNavigate('product-detail', { id: product._id || product.id })}
      className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-400 hover:shadow-elevated transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer"
    >
      <div className="relative overflow-hidden bg-slate-100 aspect-square">
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {discountPercent && (
          <span className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
            {discountPercent}% OFF
          </span>
        )}

        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
            Only {product.stock} left
          </span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 font-medium">
            <Store className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate hover:text-indigo-600 transition-colors">
              {product.vendor?.storeName || 'Verified Merchant'}
            </span>
          </div>

          <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 group-hover:text-indigo-600 transition-colors mb-2 leading-snug">
            {product.name}
          </h3>

          <div className="flex items-center gap-1.5 mb-3">
            {(product.ratings?.count > 0 || (product.ratings?.average && Number(product.ratings.average) > 0) || (product.rating && Number(product.rating) > 0)) ? (
              <>
                <div className="flex items-center text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-current" />
                </div>
                <span className="text-xs font-bold text-slate-800">
                  {Number(product.ratings?.average || product.rating || 0).toFixed(1)}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  ({product.ratings?.count || product.ratingCount || 1})
                </span>
              </>
            ) : (
              <span className="text-[11px] text-slate-400">
                No reviews yet
              </span>
            )}
          </div>
        </div>

        <div>
          
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-base sm:text-lg font-black text-slate-950">
              ${Number(product.price).toFixed(2)}
            </span>
            {product.compareAtPrice > product.price && (
              <span className="text-xs text-slate-400 line-through">
                ${Number(product.compareAtPrice).toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0}
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              added
                ? 'bg-emerald-600 text-white'
                : product.stock === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm active:scale-95'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Added
              </>
            ) : product.stock === 0 ? (
              'Sold Out'
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
