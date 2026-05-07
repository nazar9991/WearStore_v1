import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as orderController from '../controllers/order.controller.js';

const router = Router();

router.use(authenticate);

router.post('/', orderController.createOrder);
router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrderById);
router.post('/:id/cancel', orderController.cancelOrder);

export default router;
