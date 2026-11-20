import React, { useState, useEffect } from 'react';
import { Lock, Mail, User, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const Register = ({ onNavigate, initialRole = 'customer' }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(initialRole === 'vendor' ? 'vendor' : 'customer');

  useEffect(() => {
    if (initialRole) {
      setRole(initialRole === 'vendor' ? 'vendor' : 'customer');
    }
  }, [initialRole]);
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await register({
        name,
        email,
        password,
        role,
        storeName: role === 'vendor' ? storeName : undefined
      });

      if (res.success) {
        if (res.role === 'vendor') onNavigate('vendor-dashboard');
        else onNavigate('shop');
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
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
          <h2 className="text-xl font-bold text-gray-900">Create an account</h2>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            <div>
              <label className="font-semibold text-gray-700 block mb-1.5">Account Role</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`p-2.5 rounded-lg border text-center font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    role === 'customer'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Customer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('vendor')}
                  className={`p-2.5 rounded-lg border text-center font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    role === 'vendor'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>Vendor</span>
                </button>
              </div>
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
                placeholder="Jane Doe"
              />
            </div>

            {role === 'vendor' && (
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Vendor Store Name</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
                  placeholder="Jane's Tech Store"
                />
              </div>
            )}

            <div>
              <label className="font-semibold text-gray-700 block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
                placeholder="jane@example.com"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
                placeholder="Minimum 6 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg transition-colors mt-2 text-xs"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-gray-500">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
