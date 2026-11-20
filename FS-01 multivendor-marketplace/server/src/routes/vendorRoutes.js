import express from 'express';
import {
  onboardVendor,
  getMyVendorProfile,
  getVendorById,
  getAllVendors,
  getVendorStats,
  updateVendorStatus
} from '../controllers/vendorController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllVendors);
router.post('/onboard', protect, onboardVendor);
router.get('/me', protect, getMyVendorProfile);
router.get('/stats', protect, authorize('vendor', 'admin'), getVendorStats);
router.get('/:id', getVendorById);
router.put('/:id/status', protect, authorize('admin'), updateVendorStatus);

export default router;
