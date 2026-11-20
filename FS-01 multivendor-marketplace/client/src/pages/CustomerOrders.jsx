import React, { useState, useEffect } from 'react';
import {
  Package,
  Calendar,
  ArrowRight,
  Download,
  ShoppingBag,
  Star
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export const CustomerOrders = ({ onNavigate }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchOrders = async () => {
      try {
        const res = await api.getMyOrders();
        if (res.success) {
          setOrders(res.orders || []);
        }
      } catch (err) {
        console.warn('Failed to fetch customer orders', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">Delivered</span>;
      case 'shipped':
        return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">Shipped</span>;
      case 'packed':
        return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">Packed</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-xs font-bold">Placed</span>;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-950 mb-2">Sign In to View Orders</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Please sign in to track fulfillment milestones and download official tax invoices.
          </p>
          <div className="space-y-2.5">
            <button
              onClick={() => onNavigate('login')}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm"
            >
              Sign In to Your Account
            </button>
            <button
              onClick={() => onNavigate('shop')}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-950">My Orders & Invoices</h1>
            <p className="text-xs text-slate-500 mt-1">
              Track fulfillment milestones and download official PDF tax invoices
            </p>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            Browse Catalog
          </button>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-44 border border-slate-200"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 text-base mb-1">No Orders Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
              You haven't placed any orders yet. Place a test order to inspect our live order tracker and PDF invoice generator.
            </p>
            <button
              onClick={() => onNavigate('shop')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors"
            >
              Shop Catalog
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-slate-950">
                        Order #{order.orderNumber}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" /> {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.orderStatus)}
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Total</div>
                      <div className="text-base font-black text-slate-950">${order.totalAmount?.toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl">
                      <div className="flex items-center gap-3 truncate min-w-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="truncate text-xs min-w-0">
                          <div className="font-semibold text-slate-900 truncate">{item.name}</div>
                          <div className="text-slate-400 text-[10px]">
                            Qty: {item.quantity} • Merchant: {item.vendor?.storeName || 'Merchant'}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => onNavigate('product-detail', { id: item.product, openReview: true })}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 hover:border-indigo-400 px-2.5 py-1.5 rounded-lg shrink-0 transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <Star className="w-3 h-3 text-amber-500 fill-current" />
                        <span>Rate</span>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    Verified Digital Checkout • Official Invoice Ready
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => window.open(api.downloadInvoiceUrl(order._id), '_blank')}
                      className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF Invoice
                    </button>

                    <button
                      onClick={() => onNavigate('order-tracking', { orderId: order._id, returnTo: 'customer-orders' })}
                      className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <span>Track Order</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
