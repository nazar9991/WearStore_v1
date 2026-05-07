import { Router } from 'express';
import * as catalogController from '../controllers/catalog.controller.js';

const router = Router();

router.get('/categories', catalogController.getCategories);
router.get('/categories/:slug', catalogController.getCategoryBySlug);
router.get('/products', catalogController.getProducts);
router.get('/products/featured', catalogController.getFeaturedProducts);
router.get('/products/:slug', catalogController.getProductBySlug);
router.get('/search', catalogController.searchProducts);

export default router;
