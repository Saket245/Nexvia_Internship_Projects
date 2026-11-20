import React, { useState } from 'react';
import { Lock, Mail, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const Login = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.role === 'admin') onNavigate('admin-analytics');
        else if (res.role === 'vendor') onNavigate('vendor-dashboard');
        else onNavigate('shop');
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (testEmail, testPassword) => {
    setEmail(testEmail);
    setPassword(testPassword);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">

        <div className="text-center">
          <div
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 cursor-pointer mb-2"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              <Store className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-gray-900">
              Nexvia<span className="text-indigo-600">Mart</span>
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Sign in to your account</h2>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 pl-9 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  placeholder="name@example.com"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 pl-9 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  placeholder="••••••••"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg transition-colors mt-2 text-xs"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 text-[11px] text-gray-500">
            <span className="font-semibold text-gray-700 block mb-2">Click to fill demo account:</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('customer@nexviamart.com', 'CustomerPassword123!')}
                className="bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded text-gray-800 font-medium"
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('vendor.tech@nexviamart.com', 'VendorPassword123!')}
                className="bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded text-gray-800 font-medium"
              >
                Vendor
              </button>
            </div>
          </div>

          <div className="mt-4 text-center text-xs text-gray-500">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
