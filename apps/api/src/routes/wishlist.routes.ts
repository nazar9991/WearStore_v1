import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as wishlistController from '../controllers/wishlist.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', wishlistController.getWishlist);
router.post('/:productId', wishlistController.addToWishlist);
router.delete('/:productId', wishlistController.removeFromWishlist);

export default router;
