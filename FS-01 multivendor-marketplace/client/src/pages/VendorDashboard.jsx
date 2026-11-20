import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Store,
  Plus,
  Package,
  DollarSign,
  TrendingUp,
  Percent,
  Upload,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  CreditCard,
  Building,
  Image as ImageIcon
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export const VendorDashboard = ({ onNavigate, initialTab }) => {
  const { user } = useAuth();

  const [vendorProfile, setVendorProfile] = useState(null);
  const [vendorStats, setVendorStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab || 'products');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [productModalOpen, setProductModalOpen] = useState(false);
  useEffect(() => {
    if (productModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [productModalOpen]);


  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    category: 'Electronics',
    brand: '',
    stock: 20,
    tags: '',
    images: []
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  const [onboardingForm, setOnboardingForm] = useState({
    storeName: '',
    description: '',
    logo: '',
    banner: '',
    stripeAccountId: '',
    razorpayAccountId: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  const loadVendorData = async () => {
    if (!user || user.role === 'customer') {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [profileRes, statsRes, ordersRes] = await Promise.all([
        api.getMyVendorProfile(),
        api.getVendorStats(),
        api.getVendorOrders().catch(() => ({ success: false }))
      ]);

      if (profileRes.success && profileRes.vendor) {
        setVendorProfile(profileRes.vendor);
        setOnboardingForm({
          storeName: profileRes.vendor.storeName || '',
          description: profileRes.vendor.description || '',
          logo: profileRes.vendor.logo || '',
          banner: profileRes.vendor.banner || '',
          stripeAccountId: profileRes.vendor.stripeAccountId || '',
          razorpayAccountId: profileRes.vendor.razorpayAccountId || ''
        });

        const prodRes = await api.getProducts({ vendorId: profileRes.vendor._id });
        if (prodRes.success) setProducts(prodRes.products || []);
      }

      if (statsRes.success) {
        setVendorStats(statsRes.stats);
      }

      if (ordersRes && ordersRes.success) {
        setOrders(ordersRes.orders || []);
      } else if (statsRes && statsRes.recentOrders) {
        setOrders(statsRes.recentOrders || []);
      }
    } catch (err) {
      console.warn('Vendor fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        setOrders((prev) =>
          prev.map((ord) => (ord._id === orderId ? { ...ord, orderStatus: newStatus } : ord))
        );
      }
    } catch (err) {
      console.warn('Status update error', err);
    }
  };

  useEffect(() => {
    loadVendorData();
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && productModalOpen) {
        setProductModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [productModalOpen]);

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      compareAtPrice: '',
      category: 'Electronics',
      brand: vendorProfile?.storeName || '',
      stock: 25,
      tags: 'verified, official',
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80']
    });
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      description: prod.description,
      price: prod.price,
      compareAtPrice: prod.compareAtPrice || '',
      category: prod.category,
      brand: prod.brand || '',
      stock: prod.stock,
      tags: Array.isArray(prod.tags) ? prod.tags.join(', ') : prod.tags || '',
      images: prod.images || []
    });
    setProductModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.uploadImage(formData);
      if (res.success && res.url) {
        setProductForm((prev) => ({
          ...prev,
          images: [res.url, ...prev.images]
        }));
      }
    } catch (err) {
      alert('Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSavingProduct(true);
    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        compareAtPrice: productForm.compareAtPrice ? Number(productForm.compareAtPrice) : 0,
        stock: Number(productForm.stock),
        tags: productForm.tags.split(',').map((t) => t.trim())
      };

      let res;
      if (editingProduct) {
        res = await api.updateProduct(editingProduct._id, payload);
      } else {
        res = await api.createProduct(payload);
      }

      if (res.success) {
        setProductModalOpen(false);
        loadVendorData();
      } else {
        alert(res.message || 'Failed to save product');
      }
    } catch (err) {
      alert('Error saving product');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to remove this product from your inventory?')) return;
    try {
      const res = await api.deleteProduct(id);
      if (res.success) {
        setProducts(products.filter((p) => p._id !== id));
      }
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const handleSaveOnboarding = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMsg('');
    try {
      const res = await api.onboardVendor(onboardingForm);
      if (res.success) {
        setVendorProfile(res.vendor);
        setProfileSuccessMsg('Store settings updated successfully.');
        setTimeout(() => setProfileSuccessMsg(''), 3000);
      }
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setSavingProfile(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-950 mb-2">Merchant Sign In Required</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Please sign in with your vendor account to manage your store catalog, customer orders, and payouts.
          </p>
          <div className="space-y-2.5">
            <button
              onClick={() => onNavigate('login')}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm"
            >
              Sign In to Merchant Account
            </button>
            <button
              onClick={() => onNavigate('register', { role: 'vendor' })}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors"
            >
              Register as Vendor
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (user.role === 'customer') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-lg w-full text-center shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-950 mb-2">Become a Seller on NexviaMart</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            You are currently signed in with a customer account ({user.email}). To list products, manage inventory, and receive customer orders, create a merchant storefront.
          </p>
          <div className="space-y-2.5">
            <button
              onClick={() => onNavigate('register', { role: 'vendor' })}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm"
            >
              Register Vendor Storefront
            </button>
            <button
              onClick={() => onNavigate('shop')}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors"
            >
              Continue Shopping as Customer
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
      <div className="max-w-7xl mx-auto space-y-8">

        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-floating flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
          <div className="flex items-center gap-4">
            <img
              src={vendorProfile?.logo || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=300&q=80'}
              alt="Store Logo"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-400 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">{vendorProfile?.storeName || 'Merchant Store Dashboard'}</h1>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Verified Merchant
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Platform Service Cut: <strong className="text-indigo-400">{vendorStats?.commissionRate || 10}%</strong> • Automated Payout Enabled
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAddProduct}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Gross Sales</span>
              <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-950">${vendorStats?.totalGrossSales || 0}</div>
            <span className="text-[11px] text-slate-400">Total customer transactions</span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Platform Fee</span>
              <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-blue-600">${vendorStats?.totalCommissionPaid || 0}</div>
            <span className="text-[11px] text-slate-400">Retained marketplace fee</span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Net Payout</span>
              <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-600">${vendorStats?.totalNetEarnings || 0}</div>
            <span className="text-[11px] text-slate-400">Directly settled to your bank</span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Units Sold</span>
              <div className="bg-purple-50 text-purple-600 p-2.5 rounded-xl">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-purple-600">{vendorStats?.totalItemsSold || 0}</div>
            <span className="text-[11px] text-slate-400">Across your published catalog</span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
              activeTab === 'products' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Catalog Inventory ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
              activeTab === 'orders' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Customer Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
              activeTab === 'settings' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Store Branding & Settlement Details
          </button>
        </div>

        {activeTab === 'products' && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-950">Active Store Inventory</h2>
                <p className="text-xs text-slate-500">Live catalog accessible to all marketplace shoppers</p>
              </div>
              <button
                onClick={handleOpenAddProduct}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Product
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Price</th>
                    <th className="px-6 py-3">Stock</th>
                    <th className="px-6 py-3">Rating</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((prod) => (
                    <tr key={prod._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img
                          src={prod.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80'}
                          alt={prod.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                        />
                        <div className="max-w-xs">
                          <div className="font-bold text-slate-900 truncate">{prod.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">SKU: {prod.sku}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-medium">
                          {prod.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-900">
                        ${Number(prod.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${prod.stock < 10 ? 'text-amber-600' : 'text-slate-700'}`}>
                          {prod.stock} units
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {(prod.ratings?.count > 0 || (prod.ratings?.average && Number(prod.ratings.average) > 0)) ? (
                          <div className="flex items-center gap-1.5 font-bold text-slate-900">
                            <span className="text-amber-500">★</span>
                            <span>{Number(prod.ratings.average || 0).toFixed(1)}</span>
                            <span className="text-[11px] text-slate-400 font-normal">({prod.ratings.count || 1})</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-normal text-xs">No reviews</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditProduct(prod)}
                          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod._id)}
                          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-950">Customer Orders</h2>
                <p className="text-xs text-slate-500">Orders placed by customers containing your items</p>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
                {orders.length} Total Orders
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-700 text-sm">No customer orders yet</p>
                <p className="text-slate-400 mt-1">Orders containing your products will appear here with customer details and payout breakdowns.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-6 py-3">Order #</th>
                      <th className="px-6 py-3">Customer</th>
                      <th className="px-6 py-3">Items Purchased</th>
                      <th className="px-6 py-3">Gross Sales</th>
                      <th className="px-6 py-3">Platform Fee</th>
                      <th className="px-6 py-3">Net Payout</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((ord) => (
                      <tr key={ord._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-extrabold text-slate-950">
                          <button
                            onClick={() => onNavigate('order-tracking', { orderId: ord._id, returnTo: 'vendor-dashboard', returnParams: { initialTab: 'orders' } })}
                            className="hover:text-indigo-600 transition-colors font-mono"
                          >
                            #{ord.orderNumber}
                          </button>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{ord.customer?.name || ord.customerName || ord.shippingAddress?.fullName || 'Customer'}</div>
                          <div className="text-[11px] text-slate-400">{ord.shippingAddress?.city || 'Verified Buyer'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {ord.items?.map((it, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                {it.image && (
                                  <img src={it.image} alt="" className="w-6 h-6 rounded-md object-cover border border-slate-200" />
                                )}
                                <span className="font-medium text-slate-800 truncate max-w-[140px]">{it.name}</span>
                                <span className="text-slate-400 text-[10px]">x{it.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          ${(ord.vendorSubtotal || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-indigo-600 font-semibold">
                          -${(ord.platformCommission || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 font-black text-emerald-600">
                          ${(ord.vendorNet || 0).toFixed(2)}
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
                          {ord.orderStatus === 'placed' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord._id, 'packed')}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-[11px] transition-colors"
                            >
                              Pack
                            </button>
                          )}
                          {ord.orderStatus === 'packed' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord._id, 'shipped')}
                              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg text-[11px] transition-colors"
                            >
                              Ship
                            </button>
                          )}
                          {ord.orderStatus === 'shipped' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord._id, 'delivered')}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-[11px] transition-colors"
                            >
                              Deliver
                            </button>
                          )}
                          <button
                            onClick={() => onNavigate('order-tracking', { orderId: ord._id, returnTo: 'vendor-dashboard', returnParams: { initialTab: 'orders' } })}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] transition-colors"
                          >
                            Track
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-base font-black text-slate-950 mb-1">Store Profile & Payout Settings</h2>
            <p className="text-xs text-slate-500 mb-6">Manage your public storefront details and automated settlement accounts</p>

            {profileSuccessMsg && (
              <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-3.5 rounded-2xl text-xs mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {profileSuccessMsg}
              </div>
            )}

            <form onSubmit={handleSaveOnboarding} className="space-y-4 max-w-2xl text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Store Name</label>
                <input
                  type="text"
                  required
                  value={onboardingForm.storeName}
                  onChange={(e) => setOnboardingForm({ ...onboardingForm, storeName: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Store Description</label>
                <textarea
                  rows={3}
                  value={onboardingForm.description}
                  onChange={(e) => setOnboardingForm({ ...onboardingForm, description: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Settlement Account Identifier</label>
                  <input
                    type="text"
                    value={onboardingForm.stripeAccountId}
                    onChange={(e) => setOnboardingForm({ ...onboardingForm, stripeAccountId: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-mono"
                    placeholder="acct_xxxx"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Routing ID</label>
                  <input
                    type="text"
                    value={onboardingForm.razorpayAccountId}
                    onChange={(e) => setOnboardingForm({ ...onboardingForm, razorpayAccountId: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-mono"
                    placeholder="acc_xxxx"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl transition-colors"
              >
                {savingProfile ? 'Updating...' : 'Save Settings'}
              </button>
            </form>
          </div>
        )}

        {productModalOpen && createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-lg overflow-y-auto"
            onClick={() => setProductModalOpen(false)}
          >
            <div
              className="bg-white rounded-3xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-floating relative animate-modal"
              onClick={(e) => e.stopPropagation()}
            >
              
              <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white rounded-t-3xl">
                <div>
                  <h3 className="text-xl font-black text-slate-950">
                    {editingProduct ? 'Edit Product Item' : 'Add New Product'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure pricing, specifications, and uploaded media.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 flex items-center justify-center transition-all shadow-sm focus:outline-none"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Ultra Noise-Cancelling Wireless Headphones"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Selling Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Compare At / Original MSRP ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.compareAtPrice}
                      onChange={(e) => setProductForm({ ...productForm, compareAtPrice: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Category</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Home & Kitchen">Home & Kitchen</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Stock Units</label>
                    <input
                      type="number"
                      required
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Product Media</label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-colors">
                      <Upload className="w-4 h-4 text-indigo-400" />
                      <span>{uploadingImage ? 'Uploading...' : 'Choose Image File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-slate-400 text-[11px]">Supports PNG, JPG, WebP up to 5MB</span>
                  </div>

                  {productForm.images && productForm.images.length > 0 && (
                    <div className="flex items-center gap-2 mt-3">
                      {productForm.images.map((img, i) => (
                        <img key={i} src={img} alt="Product" className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Description</label>
                  <textarea
                    rows={3}
                    required
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Search Keywords</label>
                  <input
                    type="text"
                    value={productForm.tags}
                    onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                    placeholder="wireless, premium, audio"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setProductModalOpen(false)}
                    className="px-4 py-2.5 text-slate-600 hover:text-slate-900 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProduct}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl transition-colors shadow-sm"
                  >
                    {savingProduct ? 'Saving...' : 'Save Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};
