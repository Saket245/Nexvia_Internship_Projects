import React, { useState, useEffect } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  Percent,
  Store,
  ShieldCheck,
  CheckCircle2,
  Package,
  Download,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];

export const AdminAnalytics = ({ onNavigate }) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      setLoading(false);
      return;
    }
    const fetchAnalytics = async () => {
      try {
        const [analyticsRes, ordersRes] = await Promise.all([
          api.getAdminAnalytics(),
          api.getAllOrders().catch(() => ({ success: false }))
        ]);
        if (analyticsRes.success) {
          setData(analyticsRes);
        }
        if (ordersRes && ordersRes.success) {
          setOrders(ordersRes.orders || []);
        }
      } catch (err) {
        console.warn('Analytics fetch error', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  const filteredOrders = orderFilter === 'all'
    ? orders
    : orders.filter((o) => o.orderStatus === orderFilter);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-950 mb-2">Admin Sign In Required</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Platform governance and financial analytics are restricted to authorized administrators.
          </p>
          <button
            onClick={() => onNavigate('login')}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm"
          >
            Sign In with Admin Account
          </button>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-950 mb-2">Access Restricted</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            You are signed in as a <span className="font-bold capitalize">{user.role}</span>. This portal is reserved exclusively for platform administrators.
          </p>
          <button
            onClick={() => onNavigate(user.role === 'vendor' ? 'vendor-dashboard' : 'shop')}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm"
          >
            Return to {user.role === 'vendor' ? 'Vendor Dashboard' : 'Shop'}
          </button>
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

  const metrics = data?.metrics || {};
  const statusCounts = data?.statusCounts || {};
  const topVendors = data?.topVendors || [];
  const revenueTrends = data?.revenueTrends || [];
  const categoryDistribution = data?.categoryDistribution || [];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Platform Governance Portal
            </div>
            <h1 className="text-3xl font-black text-slate-950">Platform Performance & GMV</h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time monitoring of Gross Merchandise Value (GMV), platform service fees, and merchant settlements
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-900 text-indigo-300 font-semibold px-3.5 py-2 rounded-xl border border-slate-800">
              Platform Fee: {metrics.averageCommissionRate || '10%'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Gross GMV</span>
              <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-950">${metrics.totalGMV || '0.00'}</div>
            <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Total marketplace sales
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Platform Retained Fee</span>
              <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
                <Percent className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-blue-600">${metrics.totalPlatformCommission || '0.00'}</div>
            <div className="text-xs text-slate-500 mt-1">
              Net platform service revenue
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Merchant Payouts</span>
              <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-600">${metrics.totalVendorPayout || '0.00'}</div>
            <div className="text-xs text-slate-500 mt-1">
              Disbursed to merchant accounts
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Ecosystem Orders</span>
              <div className="bg-purple-50 text-purple-600 p-2.5 rounded-xl">
                <Store className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-purple-600">{metrics.totalOrders || 0}</div>
            <div className="text-xs text-slate-500 mt-1">
              {metrics.totalVendors || 3} active merchants • {metrics.totalProducts || 9} products
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-black text-slate-950">Volume & Platform Fee Growth</h2>
                <p className="text-xs text-slate-500">Gross sales vs retained fee progression</p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrends}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRev)" name="Gross GMV ($)" />
                  <Area type="monotone" dataKey="commission" stroke="#3b82f6" fillOpacity={1} fill="url(#colorComm)" name="Platform Fee ($)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-base font-black text-slate-950 mb-1">Catalog Sectors</h2>
              <p className="text-xs text-slate-500 mb-6">Distribution across marketplace categories</p>
              
              <div className="h-52 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      label
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100 text-xs">
              {categoryDistribution.map((c, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="text-slate-700 font-medium">{c.category}</span>
                  </div>
                  <span className="font-bold text-slate-900">{c.count} items</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-base font-black text-slate-950 mb-4 pb-3 border-b border-slate-100">
              Top Performing Merchants
            </h2>

            <div className="space-y-3.5">
              {topVendors.map((vendor, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-xs">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">{vendor.name}</div>
                      <div className="text-[10px] text-slate-400">{vendor.orders} fulfilled items</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-sm text-slate-900">${vendor.revenue.toFixed(2)}</div>
                    <div className="text-[10px] text-indigo-600 font-semibold">
                      +${vendor.commissionEarned?.toFixed(2)} platform fee
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-base font-black text-slate-950 mb-4 pb-3 border-b border-slate-100">
              Order Fulfillment Stages
            </h2>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-amber-50 border border-amber-200/60 p-4 rounded-2xl">
                <div className="text-amber-800 text-[10px] uppercase font-bold tracking-wider">Placed / Verified</div>
                <div className="text-2xl font-black text-amber-900 mt-1">{statusCounts.placed || 0}</div>
              </div>

              <div className="bg-blue-50 border border-blue-200/60 p-4 rounded-2xl">
                <div className="text-blue-800 text-[10px] uppercase font-bold tracking-wider">Merchant Packed</div>
                <div className="text-2xl font-black text-blue-900 mt-1">{statusCounts.packed || 0}</div>
              </div>

              <div className="bg-purple-50 border border-purple-200/60 p-4 rounded-2xl">
                <div className="text-purple-800 text-[10px] uppercase font-bold tracking-wider">In Carrier Transit</div>
                <div className="text-2xl font-black text-purple-900 mt-1">{statusCounts.shipped || 1}</div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200/60 p-4 rounded-2xl">
                <div className="text-emerald-800 text-[10px] uppercase font-bold tracking-wider">Delivered</div>
                <div className="text-2xl font-black text-emerald-900 mt-1">{statusCounts.delivered || 0}</div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-slate-900 rounded-2xl text-white text-xs">
              <div className="font-bold text-indigo-400 mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Automated Ledger Settlement
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                The platform automatically routes vendor disbursements upon checkout, maintains ledger audit trails, and generates PDF receipts.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-black text-slate-950">Customer Orders</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Platform-wide customer purchases across all verified vendors</p>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              {['all', 'placed', 'packed', 'shipped', 'delivered'].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderFilter(st)}
                  className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-colors ${
                    orderFilter === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700 text-sm">No orders matching filter</p>
              <p className="text-slate-400 mt-1">Customer orders will appear here as purchases are finalized.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-3">Order #</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Vendors / Items</th>
                    <th className="px-6 py-3">Gross Total</th>
                    <th className="px-6 py-3">Platform Fee</th>
                    <th className="px-6 py-3">Vendor Disbursed</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((ord) => {
                    const uniqueVendors = Array.from(
                      new Set(ord.items?.map((it) => it.vendor?.storeName || 'Merchant').filter(Boolean))
                    );

                    return (
                      <tr key={ord._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-extrabold text-slate-950">
                          <button
                            onClick={() => onNavigate('order-tracking', { orderId: ord._id, returnTo: 'admin-analytics' })}
                            className="hover:text-indigo-600 transition-colors font-mono"
                          >
                            #{ord.orderNumber}
                          </button>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{ord.customer?.name || ord.shippingAddress?.fullName || 'Customer'}</div>
                          <div className="text-[11px] text-slate-400">{ord.customer?.email || ord.shippingAddress?.city}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800">
                            {ord.items?.length || 0} items ({uniqueVendors.join(', ')})
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-xs">
                            {ord.items?.map((it) => `${it.name} (x${it.quantity})`).join(', ')}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-black text-slate-950">
                          ${(ord.totalAmount || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 font-bold text-indigo-600">
                          +${(ord.platformTotalCommission || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-600">
                          ${(ord.vendorTotalPayout || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              ord.orderStatus === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.orderStatus === 'shipped'
                                ? 'bg-purple-100 text-purple-800'
                                : ord.orderStatus === 'packed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.orderStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => onNavigate('order-tracking', { orderId: ord._id, returnTo: 'admin-analytics' })}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] transition-colors"
                          >
                            Track
                          </button>
                          <button
                            onClick={() => window.open(api.downloadInvoiceUrl(ord._id), '_blank')}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-[11px] transition-colors"
                          >
                            Invoice
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
