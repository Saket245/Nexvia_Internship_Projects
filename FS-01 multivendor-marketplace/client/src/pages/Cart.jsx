import React, { useState } from 'react';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Store,
  ArrowLeft
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export const Cart = ({ onNavigate }) => {
  const { items, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [validating, setValidating] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCode.trim()) return;

    setValidating(true);
    try {
      const res = await api.validateCoupon(couponCode, subtotal);
      if (res.success && res.valid) {
        setAppliedCoupon(res.coupon);
        setCouponError('');
      } else {
        setCouponError(res.message || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponError('Failed to validate coupon');
      setAppliedCoupon(null);
    } finally {
      setValidating(false);
    }
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const shippingFee = subtotal > 50 || subtotal === 0 ? 0 : 5.99;
  const tax = Math.round((Math.max(0, subtotal - discountAmount) * 0.08) * 100) / 100;
  const finalTotal = Math.round((Math.max(0, subtotal - discountAmount) + shippingFee + tax) * 100) / 100;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Your Cart is Empty</h2>
          <p className="text-xs text-slate-500 mb-6">
            Explore products from our verified independent stores and add them to your cart.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => onNavigate('shop')}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-sm"
            >
              Start Shopping
            </button>
            {!user && (
              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-950">Shopping Cart</h1>
            <p className="text-xs text-slate-500 mt-1">
              Unified checkout across multiple independent merchant storefronts
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Cart
          </button>
        </div>

        {!user && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs mb-8">
            <div className="flex items-center gap-2.5 text-amber-900">
              <ShoppingBag className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Browsing as guest:</strong> Sign in to sync your cart across devices and proceed to checkout.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onNavigate('login')}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="bg-white hover:bg-amber-100 text-slate-800 font-bold px-3.5 py-1.5 rounded-xl text-xs border border-amber-300 transition-colors"
              >
                Create Account
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80'}
                    alt={item.name}
                    className="w-20 h-20 rounded-2xl object-cover border border-slate-100 shrink-0"
                  />
                  <div>
                    <div className="text-xs text-slate-400 flex items-center gap-1 font-medium mb-1">
                      <Store className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.vendor?.storeName || 'Verified Store'}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{item.name}</h3>
                    <div className="text-sm font-black text-slate-950 mt-1">
                      ${Number(item.price).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="px-3 py-1 text-slate-600 hover:bg-slate-200 font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 font-bold text-xs text-slate-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="px-3 py-1 text-slate-600 hover:bg-slate-200 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-slate-950 text-sm">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-[11px] text-rose-500 hover:text-rose-700 font-semibold mt-0.5"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => onNavigate('shop')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 pt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-black text-slate-950 mb-4 pb-3 border-b border-slate-100">
                Order Summary
              </h2>

              <form onSubmit={handleApplyCoupon} className="mb-6">
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Have a Promo Coupon?</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. WELCOME20"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <button
                    type="submit"
                    disabled={validating}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors"
                  >
                    {validating ? 'Applying...' : 'Apply'}
                  </button>
                </div>
                {couponError && <p className="text-[11px] text-rose-500 mt-1">{couponError}</p>}
                {appliedCoupon && (
                  <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Coupon {appliedCoupon.code} applied (-${discountAmount.toFixed(2)})
                  </p>
                )}
              </form>

              <div className="space-y-3 text-xs text-slate-600 pb-4 border-b border-slate-100">
                <div className="flex justify-between">
                  <span>Items Subtotal:</span>
                  <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount ({appliedCoupon.code}):</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="font-bold text-slate-900">
                    {shippingFee === 0 ? <span className="text-emerald-600">FREE</span> : `$${shippingFee.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Estimated Tax:</span>
                  <span className="font-bold text-slate-900">${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-baseline justify-between py-4">
                <span className="text-sm font-bold text-slate-900">Total:</span>
                <span className="text-2xl font-black text-slate-950">${finalTotal.toFixed(2)}</span>
              </div>

              <button
                onClick={() => onNavigate(user ? 'checkout' : 'login', { appliedCoupon })}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.01]"
              >
                <span>{user ? 'Proceed to Checkout' : 'Sign In to Proceed to Checkout'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Protected by 256-Bit Bank Grade SSL Encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
