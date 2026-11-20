import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Store,
  Headphones,
  Shirt,
  Armchair,
  Star,
  CheckCircle2
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard.jsx';
import { api } from '../services/api.js';

export const Home = ({ onNavigate }) => {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, vendorRes] = await Promise.all([
          api.getProducts({ limit: 6, sortBy: 'rating' }),
          api.getAllVendors()
        ]);

        if (prodRes.success) setTrendingProducts(prodRes.products || []);
        if (vendorRes.success) setVendors(vendorRes.vendors || []);
      } catch (err) {
        console.warn('Failed to fetch home data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      <section className="bg-indigo-900 text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <span className="inline-block bg-indigo-800 text-indigo-200 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              Multi-Vendor Marketplace
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Shop Quality Products From Verified Independent Vendors
            </h1>
            <p className="text-indigo-200 text-sm sm:text-base mb-6 leading-relaxed">
              Browse thousands of items across electronics, fashion, and home goods in a single unified cart with transparent fulfillment and direct vendor split payments.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('shop')}
                className="bg-white text-indigo-900 hover:bg-gray-100 font-bold px-6 py-3 rounded-lg text-xs flex items-center gap-2 transition-colors shadow"
              >
                <span>Browse Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('register', { role: 'vendor' })}
                className="bg-indigo-800 hover:bg-indigo-700 text-white font-semibold px-5 py-3 rounded-lg text-xs transition-colors"
              >
                Become a Vendor
              </button>
            </div>
          </div>

          <div className="bg-indigo-800/60 border border-indigo-700/60 p-6 rounded-2xl text-xs space-y-3 max-w-sm">
            <div className="font-bold text-white text-sm">Platform Highlights</div>
            <div className="flex items-center gap-2 text-indigo-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Unified checkout across multiple vendors</span>
            </div>
            <div className="flex items-center gap-2 text-indigo-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Automated payment split & commission deduction</span>
            </div>
            <div className="flex items-center gap-2 text-indigo-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Order tracking & downloadable PDF tax invoices</span>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Browse by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div
            onClick={() => onNavigate('shop', { category: 'Electronics' })}
            className="bg-white border border-gray-200 hover:border-indigo-600 rounded-xl p-5 shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-4"
          >
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Electronics</h3>
              <p className="text-xs text-gray-500">Audio, Keyboards, Displays</p>
            </div>
          </div>

          <div
            onClick={() => onNavigate('shop', { category: 'Fashion' })}
            className="bg-white border border-gray-200 hover:border-indigo-600 rounded-xl p-5 shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-4"
          >
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <Shirt className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Fashion</h3>
              <p className="text-xs text-gray-500">Wool Coats, Bags, Watches</p>
            </div>
          </div>

          <div
            onClick={() => onNavigate('shop', { category: 'Home & Kitchen' })}
            className="bg-white border border-gray-200 hover:border-indigo-600 rounded-xl p-5 shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-4"
          >
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <Armchair className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Home & Kitchen</h3>
              <p className="text-xs text-gray-500">Desks, Cookware, Coffee Machines</p>
            </div>
          </div>
        </div>
      </section>

      {vendors.length > 0 && (
        <section className="bg-white border-y border-gray-200 py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Featured Vendors</h2>
              <button
                onClick={() => onNavigate('shop')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View All Stores →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {vendors.map((vendor) => (
                <div
                  key={vendor._id}
                  onClick={() => onNavigate('shop', { vendorId: vendor._id })}
                  className="border border-gray-200 rounded-xl p-4 hover:border-indigo-600 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={vendor.logo}
                      alt={vendor.storeName}
                      className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">{vendor.storeName}</h4>
                      <div className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{vendor.rating}</span>
                        <span className="text-gray-400 font-normal">({vendor.ratingCount} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {vendor.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Trending Products</h2>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            See More →
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-gray-200 h-72 rounded-xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            <span className="font-bold text-indigo-900 text-sm">Use Coupon Code at Checkout:</span>
            <span className="ml-2 font-mono font-bold bg-white text-indigo-600 border border-indigo-200 px-2 py-0.5 rounded">WELCOME20</span>
            <span className="ml-2 text-indigo-700">for 20% off orders over $50</span>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg transition-colors"
          >
            Shop Now
          </button>
        </div>
      </section>
    </div>
  );
};
