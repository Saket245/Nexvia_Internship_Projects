import React from 'react';
import { Store, ShieldCheck, Zap, RefreshCw, CreditCard, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const Footer = ({ onNavigate }) => {
  const { user, isVendor, isAdmin } = useAuth();
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 text-xs mt-auto">
      
      <div className="border-b border-slate-900 bg-slate-900/50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div className="flex items-center gap-3.5">
            <div className="bg-indigo-500/10 p-2.5 rounded-xl text-indigo-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-bold text-xs">Instant Catalog Search</div>
              <div className="text-slate-400 text-[11px]">Real-time suggestions and filters</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-400 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-bold text-xs">Secure Split Payments</div>
              <div className="text-slate-400 text-[11px]">Direct payouts to independent sellers</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-bold text-xs">Verified Storefronts</div>
              <div className="text-slate-400 text-[11px]">Authentic products with customer ratings</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="bg-purple-500/10 p-2.5 rounded-xl text-purple-400 shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-bold text-xs">Live Order Lifecycle</div>
              <div className="text-slate-400 text-[11px]">Real-time placed to delivered steps</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 text-white font-extrabold text-base mb-3">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Store className="w-4 h-4" />
            </div>
            NexviaMart
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px] mb-4">
            A next-generation multi-vendor marketplace connecting customers with verified independent merchants worldwide.
          </p>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
            <Lock className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted Platform
          </div>
        </div>

        <div>
          <div className="text-white font-bold mb-3 text-xs uppercase tracking-wider">Explore</div>
          <ul className="space-y-2 text-[11px]">
            <li><button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">All Products</button></li>
            <li><button onClick={() => onNavigate('shop', { category: 'Electronics' })} className="hover:text-white transition-colors">Electronics & Tech</button></li>
            <li><button onClick={() => onNavigate('shop', { category: 'Fashion' })} className="hover:text-white transition-colors">Fashion & Apparel</button></li>
            <li><button onClick={() => onNavigate('shop', { category: 'Home & Kitchen' })} className="hover:text-white transition-colors">Home & Living</button></li>
          </ul>
        </div>

        <div>
          {isAdmin ? (
            <>
              <div className="text-white font-bold mb-3 text-xs uppercase tracking-wider">Administration</div>
              <ul className="space-y-2 text-[11px]">
                <li><button onClick={() => onNavigate('admin-analytics')} className="hover:text-white transition-colors">Platform Performance</button></li>
                <li><button onClick={() => onNavigate('admin-analytics')} className="hover:text-white transition-colors">Customer Orders</button></li>
                <li><button onClick={() => onNavigate('admin-analytics')} className="hover:text-white transition-colors">Commission & Payouts</button></li>
              </ul>
            </>
          ) : isVendor ? (
            <>
              <div className="text-white font-bold mb-3 text-xs uppercase tracking-wider">Merchant Portal</div>
              <ul className="space-y-2 text-[11px]">
                <li><button onClick={() => onNavigate('vendor-dashboard', { initialTab: 'products' })} className="hover:text-white transition-colors">Catalog Management</button></li>
                <li><button onClick={() => onNavigate('vendor-dashboard', { initialTab: 'orders' })} className="hover:text-white transition-colors">Customer Orders</button></li>
                <li><button onClick={() => onNavigate('vendor-dashboard', { initialTab: 'settings' })} className="hover:text-white transition-colors">Store Profile & Payouts</button></li>
              </ul>
            </>
          ) : (
            <>
              <div className="text-white font-bold mb-3 text-xs uppercase tracking-wider">Sell on NexviaMart</div>
              <ul className="space-y-2 text-[11px]">
                <li><button onClick={() => onNavigate(user ? 'vendor-dashboard' : 'register', { role: 'vendor' })} className="hover:text-white transition-colors">Become a Seller</button></li>
                <li><button onClick={() => onNavigate('login')} className="hover:text-white transition-colors">Merchant Sign In</button></li>
                <li><button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">Storefront Guidelines</button></li>
                <li><button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">Fee & Commission Rates</button></li>
              </ul>
            </>
          )}
        </div>

        <div>
          <div className="text-white font-bold mb-3 text-xs uppercase tracking-wider">Customer Care</div>
          <ul className="space-y-2 text-[11px]">
            <li><button onClick={() => onNavigate(user ? 'customer-orders' : 'login')} className="hover:text-white transition-colors">Track Order Status</button></li>
            <li><button onClick={() => onNavigate(user ? 'customer-orders' : 'login')} className="hover:text-white transition-colors">Download Official Tax Invoices</button></li>
            <li><button onClick={() => onNavigate('cart')} className="hover:text-white transition-colors">View Cart & Checkout</button></li>
            <li>
              {user ? (
                <button onClick={() => onNavigate('customer-orders')} className="hover:text-white transition-colors">
                  My Orders ({user.name.split(' ')[0]})
                </button>
              ) : (
                <button onClick={() => onNavigate('login')} className="hover:text-white transition-colors">
                  Account Sign In
                </button>
              )}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-900 py-4 text-center text-slate-500 text-[11px]">
        © 2026 NexviaMart Marketplace Platform Inc. All rights reserved.
      </div>
    </footer>
  );
};
