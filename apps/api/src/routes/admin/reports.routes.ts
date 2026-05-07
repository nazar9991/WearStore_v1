import { Router } from 'express';
import * as reportsController from '../../controllers/admin/reports.controller.js';

const router = Router();

router.get('/dashboard', reportsController.getDashboard);
router.get('/sales', reportsController.getSalesReport);
router.get('/products/top', reportsController.getTopProducts);
router.get('/products/low-stock', reportsController.getLowStockProducts);
router.get('/customers', reportsController.getCustomersReport);

export default router;
