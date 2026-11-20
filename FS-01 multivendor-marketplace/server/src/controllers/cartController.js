import { getRedisClient } from '../config/redis.js';
import { Product } from '../models/Product.js';

const CART_TTL = 7 * 24 * 60 * 60; 

const getCartKey = (req) => {
  if (req.user && req.user._id) {
    return `cart:user:${req.user._id}`;
  }
  const guestSessionId = req.headers['x-guest-session'] || req.query.sessionId || 'guest_default';
  return `cart:guest:${guestSessionId}`;
};

export const getCart = async (req, res) => {
  try {
    const redis = getRedisClient();
    const cartKey = getCartKey(req);
    const rawCart = await redis.get(cartKey);

    let items = [];
    if (rawCart) {
      try {
        items = typeof rawCart === 'string' ? JSON.parse(rawCart) : rawCart;
      } catch {
        items = [];
      }
    }

    const refreshedItems = [];
    let subtotal = 0;

    for (const it of items) {
      const prod = await Product.findById(it.productId).populate('vendor', 'storeName commissionRate');
      if (prod && prod.isPublished) {
        const itemTotal = prod.price * it.quantity;
        subtotal += itemTotal;
        refreshedItems.push({
          productId: prod._id,
          name: prod.name,
          price: prod.price,
          compareAtPrice: prod.compareAtPrice,
          image: prod.images[0] || '',
          vendor: prod.vendor,
          quantity: Math.min(it.quantity, prod.stock),
          stock: prod.stock,
          itemTotal
        });
      }
    }

    await redis.set(cartKey, JSON.stringify(refreshedItems), 'EX', CART_TTL);

    return res.json({
      success: true,
      items: refreshedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      itemCount: refreshedItems.reduce((acc, it) => acc + it.quantity, 0),
      storage: 'redis-cache'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const prod = await Product.findById(productId).populate('vendor', 'storeName commissionRate');
    if (!prod) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const redis = getRedisClient();
    const cartKey = getCartKey(req);
    const rawCart = await redis.get(cartKey);
    let items = rawCart ? (typeof rawCart === 'string' ? JSON.parse(rawCart) : rawCart) : [];

    const existingIndex = items.findIndex((it) => it.productId.toString() === productId.toString());
    const qty = Number(quantity);

    if (existingIndex > -1) {
      const newQty = items[existingIndex].quantity + qty;
      items[existingIndex].quantity = Math.min(newQty, prod.stock);
    } else {
      items.push({
        productId: prod._id,
        quantity: Math.min(qty, prod.stock)
      });
    }

    await redis.set(cartKey, JSON.stringify(items), 'EX', CART_TTL);

    return res.json({
      success: true,
      message: 'Product added to Redis cart',
      itemsCount: items.reduce((acc, it) => acc + it.quantity, 0)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const redis = getRedisClient();
    const cartKey = getCartKey(req);
    const rawCart = await redis.get(cartKey);
    let items = rawCart ? (typeof rawCart === 'string' ? JSON.parse(rawCart) : rawCart) : [];

    const targetIndex = items.findIndex((it) => it.productId.toString() === productId.toString());
    if (targetIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not in cart' });
    }

    const qty = Number(quantity);
    if (qty <= 0) {
      items.splice(targetIndex, 1);
    } else {
      items[targetIndex].quantity = qty;
    }

    await redis.set(cartKey, JSON.stringify(items), 'EX', CART_TTL);

    return res.json({ success: true, message: 'Cart updated in Redis cache', items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const redis = getRedisClient();
    const cartKey = getCartKey(req);
    const rawCart = await redis.get(cartKey);
    let items = rawCart ? (typeof rawCart === 'string' ? JSON.parse(rawCart) : rawCart) : [];

    items = items.filter((it) => it.productId.toString() !== productId.toString());
    await redis.set(cartKey, JSON.stringify(items), 'EX', CART_TTL);

    return res.json({ success: true, message: 'Item removed from Redis cart', items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const redis = getRedisClient();
    const cartKey = getCartKey(req);
    await redis.del(cartKey);
    return res.json({ success: true, message: 'Redis cart cleared' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
