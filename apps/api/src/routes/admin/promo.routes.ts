import { Router } from 'express';
import * as promoController from '../../controllers/admin/promo.controller.js';

const router = Router();

router.get('/', promoController.getPromoCodes);
router.post('/', promoController.createPromoCode);
router.put('/:id', promoController.updatePromoCode);
router.delete('/:id', promoController.deletePromoCode);

export default router;
