import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nexviamart_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.login({ email, password });
      if (res.success && res.token) {
        localStorage.setItem('nexviamart_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true, role: res.user.role };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Connection error with backend' };
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.register(formData);
      if (res.success && res.token) {
        localStorage.setItem('nexviamart_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true, role: res.user.role };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Connection error with backend' };
    }
  };

  const logout = () => {
    localStorage.removeItem('nexviamart_token');
    setToken(null);
    setUser(null);
  };

  const isCustomer = user?.role === 'customer';
  const isVendor = user?.role === 'vendor';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isCustomer,
        isVendor,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
