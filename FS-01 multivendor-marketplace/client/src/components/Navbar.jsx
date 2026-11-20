import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ShoppingCart,
  User,
  Store,
  BarChart3,
  LogOut,
  Menu,
  X,
  Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { api } from '../services/api.js';

export const Navbar = ({ onNavigate, currentPage }) => {
  const { user, logout, isVendor, isAdmin } = useAuth();
  const { itemCount } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const searchRef = useRef(null);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.getSuggestions(searchQuery);
        if (res.success) {
          setSuggestions(res.suggestions || []);
        }
      } catch (err) {
        console.warn('Suggestions failed', err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    onNavigate('shop', { q: searchQuery, category: selectedCategory !== 'All' ? selectedCategory : '' });
  };

  const handleSuggestionClick = (item) => {
    setSearchQuery(item.text);
    setShowSuggestions(false);
    onNavigate('product-detail', { id: item.id });
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                <Store className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-gray-900">
                Nexvia<span className="text-indigo-600">Mart</span>
              </span>
            </div>
          </div>

          <div ref={searchRef} className="hidden sm:flex flex-1 max-w-lg relative">
            <form onSubmit={handleSearchSubmit} className="flex w-full border border-gray-300 rounded-lg overflow-hidden focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-gray-50 text-gray-700 text-xs px-2.5 py-2 border-r border-gray-300 focus:outline-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Home & Kitchen">Home & Kitchen</option>
              </select>

              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full px-3 py-2 text-xs text-gray-900 focus:outline-none"
              />

              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 flex items-center justify-center"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
                {suggestions.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSuggestionClick(item)}
                    className="px-3.5 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between text-xs border-b border-gray-50 last:border-0"
                  >
                    <span className="font-medium text-gray-800">{item.text}</span>
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{item.category}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-gray-600">
            <button
              onClick={() => onNavigate('shop')}
              className={`hover:text-indigo-600 transition-colors ${currentPage === 'shop' ? 'text-indigo-600 font-bold' : ''}`}
            >
              Shop
            </button>

            {user && (
              <button
                onClick={() => onNavigate('customer-orders')}
                className={`hover:text-indigo-600 transition-colors ${currentPage === 'customer-orders' ? 'text-indigo-600 font-bold' : ''}`}
              >
                My Orders
              </button>
            )}

            {isVendor && (
              <button
                onClick={() => onNavigate('vendor-dashboard')}
                className={`flex items-center gap-1 hover:text-indigo-600 transition-colors ${currentPage === 'vendor-dashboard' ? 'text-indigo-600 font-bold' : ''}`}
              >
                <Store className="w-3.5 h-3.5" />
                Vendor Dashboard
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => onNavigate('admin-analytics')}
                className={`flex items-center gap-1 hover:text-indigo-600 transition-colors ${currentPage === 'admin-analytics' ? 'text-indigo-600 font-bold' : ''}`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Admin Analytics
              </button>
            )}
          </nav>

          <div className="flex items-center gap-3">
            
            <button
              onClick={() => onNavigate('cart')}
              className="relative p-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white font-bold text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 text-xs font-semibold text-gray-700"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-gray-200"
                  />
                  <span className="hidden sm:inline capitalize">{user.name.split(' ')[0]}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <div className="font-bold text-gray-900 truncate">{user.name}</div>
                      <div className="text-[10px] text-gray-500 capitalize">{user.role} role</div>
                    </div>

                    <button
                      onClick={() => { setUserDropdownOpen(false); onNavigate('customer-orders'); }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                    >
                      <Package className="w-3.5 h-3.5 text-gray-400" />
                      Orders & Invoices
                    </button>

                    {isVendor && (
                      <button
                        onClick={() => { setUserDropdownOpen(false); onNavigate('vendor-dashboard'); }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                      >
                        <Store className="w-3.5 h-3.5 text-indigo-600" />
                        Vendor Portal
                      </button>
                    )}

                    {isAdmin && (
                      <button
                        onClick={() => { setUserDropdownOpen(false); onNavigate('admin-analytics'); }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                        Admin Analytics
                      </button>
                    )}

                    <div className="border-t border-gray-100 my-0.5"></div>

                    <button
                      onClick={() => { setUserDropdownOpen(false); logout(); onNavigate('home'); }}
                      className="w-full px-3 py-2 text-left hover:bg-rose-50 flex items-center gap-2 text-rose-600 font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 px-4 py-3 bg-gray-50 space-y-2 text-xs font-semibold">
          <form onSubmit={handleSearchSubmit} className="flex mb-3">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-l-lg text-xs focus:outline-none"
            />
            <button type="submit" className="bg-indigo-600 text-white px-3 rounded-r-lg font-bold">
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>

          <button onClick={() => { setMobileMenuOpen(false); onNavigate('shop'); }} className="block w-full text-left py-1 text-gray-700">All Products</button>
          {user && (
            <button onClick={() => { setMobileMenuOpen(false); onNavigate('customer-orders'); }} className="block w-full text-left py-1 text-gray-700">My Orders</button>
          )}
          {isVendor && (
            <button onClick={() => { setMobileMenuOpen(false); onNavigate('vendor-dashboard'); }} className="block w-full text-left py-1 text-indigo-600">Vendor Dashboard</button>
          )}
          {isAdmin && (
            <button onClick={() => { setMobileMenuOpen(false); onNavigate('admin-analytics'); }} className="block w-full text-left py-1 text-blue-600">Admin Analytics</button>
          )}
        </div>
      )}
    </header>
  );
};
