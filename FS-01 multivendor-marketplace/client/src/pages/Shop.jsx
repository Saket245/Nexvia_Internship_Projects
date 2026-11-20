import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  SlidersHorizontal,
  Star,
  X,
  ArrowUpDown,
  RotateCcw
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard.jsx';
import { api } from '../services/api.js';

const normalizeCategory = (cat) => {
  if (!cat) return '';
  const lower = cat.toLowerCase();
  if (lower.includes('electronic')) return 'Electronics';
  if (lower.includes('fashion') || lower.includes('apparel')) return 'Fashion';
  if (lower.includes('home') || lower.includes('kitchen') || lower.includes('living')) return 'Home & Kitchen';
  return cat;
};

export const Shop = ({ initialParams = {}, onNavigate }) => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState(initialParams.q || '');
  const [selectedCategory, setSelectedCategory] = useState(normalizeCategory(initialParams.category || ''));
  const [selectedBrand, setSelectedBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (initialParams.category !== undefined) {
      setSelectedCategory(normalizeCategory(initialParams.category));
    }
    if (initialParams.q !== undefined) {
      setSearchQuery(initialParams.q || '');
    }
    setPage(1);
  }, [initialParams.category, initialParams.q, initialParams.vendorId]);

  const fetchSearchResults = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        q: searchQuery,
        category: selectedCategory,
        brand: selectedBrand,
        minPrice,
        maxPrice,
        minRating,
        sortBy,
        page,
        limit: 12
      };

      if (initialParams.vendorId) {
        params.vendorId = initialParams.vendorId;
      }

      const res = await api.search(params);

      if (res.success) {
        setProducts(res.hits || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.warn('Search error', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedBrand, minPrice, maxPrice, minRating, sortBy, page, initialParams.vendorId]);

  useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedBrand('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setSortBy('featured');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 mb-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-950">Marketplace Catalog</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {products.length} of {total} verified merchant items
            </p>
          </div>

          <div className="flex items-center gap-3">
            
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="md:hidden flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 focus:outline-none cursor-pointer font-medium"
              >
                <option value="featured">Featured / Best Match</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          <aside className={`md:block ${mobileFilterOpen ? 'block' : 'hidden'} bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm h-fit space-y-6`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                Refine Results
              </div>
              <button
                onClick={handleResetFilters}
                className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1 font-medium transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Search Keyword</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Headphones, Wool..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full text-xs px-3 py-2 pl-8 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-slate-50/50"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Category</label>
              <div className="space-y-1 text-xs font-medium">
                <button
                  onClick={() => { setSelectedCategory(''); setPage(1); }}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between ${
                    selectedCategory === '' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>All Categories</span>
                  {selectedCategory === '' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </button>
                {['Electronics', 'Fashion', 'Home & Kitchen'].map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); setPage(1); }}
                      className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between ${
                        isSelected ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{cat}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Price Range ($)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
                <span className="text-slate-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Customer Rating</label>
              <div className="space-y-1 text-xs">
                {[4, 3, 2].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => { setMinRating(minRating === String(stars) ? '' : String(stars)); setPage(1); }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl flex items-center gap-2 transition-colors ${
                      minRating === String(stars) ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex text-amber-400">
                      {Array.from({ length: stars }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span>{stars}★ & above</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <main className="md:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white border border-slate-200 rounded-3xl h-80"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-900 text-lg mb-1">No products match your criteria</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                  Try adjusting your price range or clearing search keywords.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((prod) => (
                    <ProductCard
                      key={prod.id || prod._id}
                      product={prod}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="text-xs font-medium text-slate-500 px-3">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
