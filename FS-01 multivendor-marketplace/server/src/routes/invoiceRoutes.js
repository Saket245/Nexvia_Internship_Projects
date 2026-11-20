import express from 'express';
import { getInvoiceData, downloadInvoicePdf } from '../controllers/invoiceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/:orderId', protect, getInvoiceData);
router.get('/:orderId/download', protect, downloadInvoicePdf);

export default router;
