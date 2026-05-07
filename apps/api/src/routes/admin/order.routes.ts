import { Router } from 'express';
import * as orderController from '../../controllers/admin/order.controller.js';

const router = Router();

router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/status', orderController.updateStatus);
router.patch('/:id/tracking', orderController.addTrackingNumber);
router.patch('/:id/note', orderController.addManagerNote);

export default router;
