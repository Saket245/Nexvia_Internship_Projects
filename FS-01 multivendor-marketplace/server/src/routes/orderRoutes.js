import express from 'express';
import {
  createOrder,
  getOrderById,
  getMyOrders,
  getVendorOrders,
  updateOrderStatus,
  getAllOrders
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/vendor-orders', protect, authorize('vendor'), getVendorOrders);
router.get('/all', protect, authorize('admin'), getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, authorize('vendor', 'admin'), updateOrderStatus);

export default router;
