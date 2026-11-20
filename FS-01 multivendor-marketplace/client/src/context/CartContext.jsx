import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const refreshCart = useCallback(async () => {
    try {
      const res = await api.getCart();
      if (res.success) {
        setItems(res.items || []);
        setSubtotal(res.subtotal || 0);
        setItemCount(res.itemCount || 0);
      }
    } catch (err) {
      console.warn('Failed to load cart', err);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [user, refreshCart]);

  const addToCart = async (productId, quantity = 1) => {
    setLoading(true);
    try {
      const res = await api.addToCart(productId, quantity);
      if (res.success) {
        await refreshCart();
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await api.updateCartItem(productId, quantity);
      if (res.success) {
        await refreshCart();
      }
    } catch (err) {
      console.warn('Update quantity failed', err);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await api.removeFromCart(productId);
      if (res.success) {
        await refreshCart();
      }
    } catch (err) {
      console.warn('Remove item failed', err);
    }
  };

  const clearCart = async () => {
    try {
      await api.clearCart();
      setItems([]);
      setSubtotal(0);
      setItemCount(0);
    } catch (err) {
      console.warn('Clear cart failed', err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        itemCount,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
