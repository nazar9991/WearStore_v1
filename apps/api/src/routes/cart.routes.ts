import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as cartController from '../controllers/cart.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/items', cartController.addItem);
router.patch('/items/:id', cartController.updateItemQuantity);
router.delete('/items/:id', cartController.removeItem);
router.delete('/', cartController.clearCart);
router.post('/apply-promo', cartController.applyPromoCode);

export default router;
