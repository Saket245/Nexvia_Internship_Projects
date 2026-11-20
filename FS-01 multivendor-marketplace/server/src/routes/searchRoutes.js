import express from 'express';
import { searchProducts, getSearchSuggestions } from '../controllers/searchController.js';

const router = express.Router();

router.get('/', searchProducts);
router.get('/suggestions', getSearchSuggestions);

export default router;
