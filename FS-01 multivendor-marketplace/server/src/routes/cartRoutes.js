import express from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.get('/', optionalAuth, getCart);
router.post('/add', optionalAuth, addToCart);
router.put('/update', optionalAuth, updateCartItem);
router.delete('/item/:productId', optionalAuth, removeFromCart);
router.delete('/clear', optionalAuth, clearCart);

export default router;
