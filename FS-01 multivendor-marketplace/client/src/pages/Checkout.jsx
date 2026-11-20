import React, { useState } from 'react';
import {
  CreditCard,
  Truck,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export const Checkout = ({ appliedCoupon = null, onNavigate }) => {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || 'Alex Rivera',
    street: user?.addresses?.[0]?.street || '742 Evergreen Terrace',
    city: user?.addresses?.[0]?.city || 'Springfield',
    state: user?.addresses?.[0]?.state || 'OR',
    zipCode: user?.addresses?.[0]?.zipCode || '97477',
    country: 'USA',
    phone: user?.phone || '+1 (555) 789-4321'
  });

  const [paymentGateway, setPaymentGateway] = useState('stripe');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const shippingFee = subtotal > 50 || subtotal === 0 ? 0 : 5.99;
  const tax = Math.round((Math.max(0, subtotal - discountAmount) * 0.08) * 100) / 100;
  const totalAmount = Math.round((Math.max(0, subtotal - discountAmount) + shippingFee + tax) * 100) / 100;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      onNavigate('login');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const res = await api.createOrder({
        items,
        shippingAddress,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        paymentGateway
      });

      if (res.success && res.order) {
        await clearCart();
        onNavigate('order-tracking', { orderId: res.order._id, returnTo: 'customer-orders' });
      } else {
        setError(res.message || 'Payment failed. Please retry.');
      }
    } catch (err) {
      setError(err.message || 'Network error during checkout');
    } finally {
      setProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-950 mb-2">Sign In to Complete Checkout</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Please sign in or create an account to enter your delivery address and finalize your order.
          </p>
          <div className="space-y-2.5">
            <button
              onClick={() => onNavigate('login')}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm"
            >
              Sign In to Checkout
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors"
            >
              Create Account
            </button>
            <button
              onClick={() => onNavigate('cart')}
              className="w-full text-slate-500 hover:text-slate-700 text-xs font-semibold pt-1"
            >
              Return to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md w-full text-center shadow-sm">
          <h2 className="text-xl font-black text-slate-950 mb-2">Your Cart is Empty</h2>
          <p className="text-xs text-slate-500 mb-6">
            Add items to your cart before proceeding to checkout.
          </p>
          <button
            onClick={() => onNavigate('shop')}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => onNavigate('cart')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-indigo-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Cart
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-6">

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-600" />
                Shipping Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.fullName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-gray-700 block mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.zipCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                Payment Gateway
              </h2>

              <div className="space-y-3 text-xs">
                <label className={`block border rounded-lg p-3 cursor-pointer ${paymentGateway === 'stripe' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-200'}`}>
                  <input
                    type="radio"
                    name="gateway"
                    value="stripe"
                    checked={paymentGateway === 'stripe'}
                    onChange={() => setPaymentGateway('stripe')}
                    className="mr-2 text-indigo-600"
                  />
                  <span className="font-semibold text-gray-900">Credit / Debit Card (Online Payment)</span>
                  <p className="text-gray-500 text-[11px] ml-5 mt-0.5">Direct card payment with automated vendor disbursement</p>
                </label>

                <label className={`block border rounded-lg p-3 cursor-pointer ${paymentGateway === 'razorpay' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-200'}`}>
                  <input
                    type="radio"
                    name="gateway"
                    value="razorpay"
                    checked={paymentGateway === 'razorpay'}
                    onChange={() => setPaymentGateway('razorpay')}
                    className="mr-2 text-indigo-600"
                  />
                  <span className="font-semibold text-gray-900">Digital Payments / UPI / NetBanking</span>
                  <p className="text-gray-500 text-[11px] ml-5 mt-0.5">Instant digital settlement with multi-vendor account transfer</p>
                </label>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm sticky top-20 text-xs">
              <h3 className="font-bold text-sm text-gray-900 mb-3 pb-2 border-b border-gray-100">
                Order Review ({items.length} items)
              </h3>

              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {items.map((it) => (
                  <div key={it.productId} className="flex justify-between">
                    <span className="truncate pr-2">{it.name} (×{it.quantity})</span>
                    <span className="font-semibold">${(it.price * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-3 text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount ({appliedCoupon.code}):</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="font-semibold text-gray-900">{shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span className="font-semibold text-gray-900">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-100 pt-2">
                  <span>Total:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={processing}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 mt-5 transition-colors disabled:opacity-50"
              >
                {processing ? 'Processing...' : `Place Order ($${totalAmount.toFixed(2)})`}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
