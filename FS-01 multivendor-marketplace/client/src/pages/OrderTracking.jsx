import React, { useState, useEffect } from 'react';
import {
  Download,
  Package,
  Calendar,
  Store,
  ArrowLeft,
  Truck,
  ShieldCheck
} from 'lucide-react';
import { OrderLifecycleStepper } from '../components/OrderLifecycleStepper.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export const OrderTracking = ({ orderId, returnTo, returnParams, onNavigate }) => {
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const getBackTarget = () => {
    if (returnTo) {
      return {
        page: returnTo,
        params: returnParams || (returnTo === 'vendor-dashboard' ? { initialTab: 'orders' } : {})
      };
    }
    if (user?.role === 'vendor') {
      return { page: 'vendor-dashboard', params: { initialTab: 'orders' } };
    }
    if (user?.role === 'admin') {
      return { page: 'admin-analytics', params: {} };
    }
    return { page: 'customer-orders', params: {} };
  };

  const handleBack = () => {
    const target = getBackTarget();
    onNavigate(target.page, target.params);
  };

  const getBackLabel = () => {
    const target = getBackTarget();
    if (target.page === 'vendor-dashboard') return 'Back to Dashboard';
    if (target.page === 'admin-analytics') return 'Back to Dashboard';
    return 'All Orders';
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.getOrderById(orderId);
        if (res.success) {
          setOrder(res.order);
        }
      } catch (err) {
        console.warn('Failed to load order', err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handleDownloadInvoice = () => {
    window.open(api.downloadInvoiceUrl(order._id), '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-center">
        <h2 className="text-xl font-bold text-slate-800">Order Not Found</h2>
        <button onClick={handleBack} className="mt-4 text-indigo-600 font-bold text-sm">
          {getBackLabel()}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> {getBackLabel()}
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 flex items-center gap-3">
              <span>Order #{order.orderNumber}</span>
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {new Date(order.createdAt).toLocaleDateString()}
              </span>
              <span>•</span>
              <span className="capitalize font-semibold text-emerald-600">
                Payment: {order.payment?.status}
              </span>
            </div>
          </div>

          <button
            onClick={handleDownloadInvoice}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Invoice</span>
          </button>
        </div>

        <OrderLifecycleStepper
          order={order}
          onStatusUpdated={(updatedOrder) => setOrder(updatedOrder)}
          allowSimulation={true}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-base font-black text-slate-950 mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              Order Items ({order.items?.length || 0})
            </h2>

            <div className="space-y-6">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80'}
                      alt={item.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shrink-0"
                    />
                    <div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mb-1 font-medium">
                        <Store className="w-3 h-3 text-slate-400" />
                        <span>{item.vendor?.storeName || 'Merchant'}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{item.name}</h4>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Qty: {item.quantity} × ${Number(item.price).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-slate-950">
                      ${Number(item.itemTotal).toFixed(2)}
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-semibold capitalize mt-1 inline-block">
                      {item.itemStatus || order.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-black text-slate-950 mb-4 pb-3 border-b border-slate-100">
                Payment Summary
              </h2>

              <div className="space-y-2.5 text-xs text-slate-600 mb-4 pb-4 border-b border-slate-100">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-900">${order.subtotal?.toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount:</span>
                    <span>-${order.discount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="font-bold text-slate-900">
                    {order.shippingFee === 0 ? 'FREE' : `$${order.shippingFee?.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span className="font-bold text-slate-900">${order.tax?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-950 pt-2 border-t border-slate-100">
                  <span>Total Paid:</span>
                  <span>${order.totalAmount?.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-slate-900 rounded-2xl p-4 text-white text-xs space-y-2 border border-slate-800">
                <div className="font-bold text-indigo-400 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Automated Split Breakdown
                </div>
                <div className="flex justify-between text-slate-300 text-[11px]">
                  <span>Platform Fee:</span>
                  <span className="font-bold text-indigo-300">${order.platformTotalCommission?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-300 text-[11px]">
                  <span>Merchant Settlement:</span>
                  <span className="font-bold text-emerald-400">${order.vendorTotalPayout?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm text-xs">
              <div className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-indigo-600" /> Delivery Address
              </div>
              <div className="text-slate-800 font-bold">{order.shippingAddress?.fullName}</div>
              <div className="text-slate-500 mt-1 leading-relaxed">
                {order.shippingAddress?.street}<br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}<br />
                {order.shippingAddress?.country}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
