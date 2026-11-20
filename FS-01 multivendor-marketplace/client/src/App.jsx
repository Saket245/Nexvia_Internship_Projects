import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { Navbar } from './components/Navbar.jsx';
import { Footer } from './components/Footer.jsx';

import { Home } from './pages/Home.jsx';
import { Shop } from './pages/Shop.jsx';
import { ProductDetail } from './pages/ProductDetail.jsx';
import { Cart } from './pages/Cart.jsx';
import { Checkout } from './pages/Checkout.jsx';
import { OrderTracking } from './pages/OrderTracking.jsx';
import { CustomerOrders } from './pages/CustomerOrders.jsx';
import { VendorDashboard } from './pages/VendorDashboard.jsx';
import { AdminAnalytics } from './pages/AdminAnalytics.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';

export function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageParams, setPageParams] = useState({});

  const handleNavigate = (page, params = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'shop':
        return (
          <Shop
            key={`shop-${pageParams.category || ''}-${pageParams.q || ''}-${pageParams.vendorId || ''}`}
            initialParams={pageParams}
            onNavigate={handleNavigate}
          />
        );
      case 'product-detail':
        return <ProductDetail productId={pageParams.id} initialOpenReview={pageParams.openReview} onNavigate={handleNavigate} />;
      case 'cart':
        return <Cart onNavigate={handleNavigate} />;
      case 'checkout':
        return <Checkout appliedCoupon={pageParams.appliedCoupon} onNavigate={handleNavigate} />;
      case 'order-tracking':
        return (
          <OrderTracking
            orderId={pageParams.orderId}
            returnTo={pageParams.returnTo}
            returnParams={pageParams.returnParams}
            onNavigate={handleNavigate}
          />
        );
      case 'customer-orders':
        return <CustomerOrders onNavigate={handleNavigate} />;
      case 'vendor-dashboard':
        return (
          <VendorDashboard
            key={`vendor-dashboard-${pageParams.initialTab || 'products'}`}
            initialTab={pageParams.initialTab}
            onNavigate={handleNavigate}
          />
        );
      case 'admin-analytics':
        return <AdminAnalytics onNavigate={handleNavigate} />;
      case 'login':
        return <Login onNavigate={handleNavigate} />;
      case 'register':
        return <Register initialRole={pageParams.role} onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
          <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
          <main className="flex-1">{renderPage()}</main>
          <Footer onNavigate={handleNavigate} />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
