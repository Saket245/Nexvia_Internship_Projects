import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadMedia
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, authorize('vendor', 'admin'), createProduct);
router.put('/:id', protect, authorize('vendor', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('vendor', 'admin'), deleteProduct);
router.post('/upload', protect, authorize('vendor', 'admin'), upload.single('image'), uploadMedia);

export default router;
