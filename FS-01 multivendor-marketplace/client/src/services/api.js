const API_BASE = '/api';

const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('nexviamart_token');
  const guestSession = localStorage.getItem('nexviamart_guest_session') || `guest_${Date.now()}`;
  localStorage.setItem('nexviamart_guest_session', guestSession);

  const headers = {
    'x-guest-session': guestSession
  };

  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export const api = {
  
  register: async (data) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      return {
        success: false,
        message: err.message && err.message.includes('Failed to fetch')
          ? 'Unable to connect to backend server. Please verify backend is running on port 5000.'
          : (err.message || 'Registration failed')
      };
    }
  },
  login: async (data) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      return {
        success: false,
        message: err.message && err.message.includes('Failed to fetch')
          ? 'Unable to connect to backend server. Please verify backend is running on port 5000.'
          : (err.message || 'Login failed')
      };
    }
  },
  getMe: async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders()
      });
      return await res.json();
    } catch {
      return { success: false, message: 'Failed to verify session' };
    }
  },

  getProducts: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/products?${query}`, {
      headers: getHeaders()
    });
    return res.json();
  },
  getProductById: async (id) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      headers: getHeaders()
    });
    return res.json();
  },
  createProduct: async (data) => {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateProduct: async (id, data) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteProduct: async (id) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },
  uploadImage: async (formData) => {
    const res = await fetch(`${API_BASE}/products/upload`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    return res.json();
  },

  search: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/search?${query}`, {
      headers: getHeaders()
    });
    return res.json();
  },
  getSuggestions: async (q) => {
    const res = await fetch(`${API_BASE}/search/suggestions?q=${encodeURIComponent(q)}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getCart: async () => {
    const res = await fetch(`${API_BASE}/cart`, {
      headers: getHeaders()
    });
    return res.json();
  },
  addToCart: async (productId, quantity = 1) => {
    const res = await fetch(`${API_BASE}/cart/add`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ productId, quantity })
    });
    return res.json();
  },
  updateCartItem: async (productId, quantity) => {
    const res = await fetch(`${API_BASE}/cart/update`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ productId, quantity })
    });
    return res.json();
  },
  removeFromCart: async (productId) => {
    const res = await fetch(`${API_BASE}/cart/item/${productId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },
  clearCart: async () => {
    const res = await fetch(`${API_BASE}/cart/clear`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  createOrder: async (data) => {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  getOrderById: async (id) => {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      headers: getHeaders()
    });
    return res.json();
  },
  getMyOrders: async () => {
    const res = await fetch(`${API_BASE}/orders/my-orders`, {
      headers: getHeaders()
    });
    return res.json();
  },
  getVendorOrders: async () => {
    const res = await fetch(`${API_BASE}/orders/vendor-orders`, {
      headers: getHeaders()
    });
    return res.json();
  },
  updateOrderStatus: async (id, status, note) => {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status, note })
    });
    return res.json();
  },
  getAllOrders: async () => {
    const res = await fetch(`${API_BASE}/orders/all`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getAllVendors: async () => {
    const res = await fetch(`${API_BASE}/vendors`, {
      headers: getHeaders()
    });
    return res.json();
  },
  getVendorById: async (id) => {
    const res = await fetch(`${API_BASE}/vendors/${id}`, {
      headers: getHeaders()
    });
    return res.json();
  },
  getMyVendorProfile: async () => {
    const res = await fetch(`${API_BASE}/vendors/me`, {
      headers: getHeaders()
    });
    return res.json();
  },
  getVendorStats: async () => {
    const res = await fetch(`${API_BASE}/vendors/stats`, {
      headers: getHeaders()
    });
    return res.json();
  },
  onboardVendor: async (data) => {
    const res = await fetch(`${API_BASE}/vendors/onboard`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  validateCoupon: async (code, orderAmount) => {
    const res = await fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code, orderAmount })
    });
    return res.json();
  },

  getProductReviews: async (productId) => {
    try {
      const res = await fetch(`${API_BASE}/reviews/product/${productId}`, {
        headers: getHeaders()
      });
      return await res.json();
    } catch (err) {
      return { success: false, reviews: [], count: 0, message: err.message };
    }
  },
  addReview: async (data) => {
    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message || 'Failed to submit rating' };
    }
  },

  getInvoiceData: async (orderId) => {
    const res = await fetch(`${API_BASE}/invoices/${orderId}`, {
      headers: getHeaders()
    });
    return res.json();
  },
  downloadInvoiceUrl: (orderId) => {
    const token = localStorage.getItem('nexviamart_token');
    return `${API_BASE}/invoices/${orderId}/download${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },
  downloadInvoice: async (orderId, orderNumber = 'invoice') => {
    const token = localStorage.getItem('nexviamart_token');
    const res = await fetch(`${API_BASE}/invoices/${orderId}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to download invoice');
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${orderNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  getAdminAnalytics: async () => {
    const res = await fetch(`${API_BASE}/analytics/admin`, {
      headers: getHeaders()
    });
    return res.json();
  }
};
