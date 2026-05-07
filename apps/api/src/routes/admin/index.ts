import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import productRoutes from './product.routes.js';
import categoryRoutes from './category.routes.js';
import orderRoutes from './order.routes.js';
import userRoutes from './user.routes.js';
import promoRoutes from './promo.routes.js';
import reportsRoutes from './reports.routes.js';
import * as reportsController from '../../controllers/admin/reports.controller.js';

const router = Router();

// All admin routes require authentication
router.use(authenticate);

// Manager and Admin routes
router.use('/products', requireRole('MANAGER', 'ADMIN'), productRoutes);
router.use('/categories', requireRole('MANAGER', 'ADMIN'), categoryRoutes);
router.use('/orders', requireRole('MANAGER', 'ADMIN'), orderRoutes);
router.use('/promo-codes', requireRole('MANAGER', 'ADMIN'), promoRoutes);

// Dashboard available for both Manager and Admin
router.get('/dashboard', requireRole('MANAGER', 'ADMIN'), reportsController.getDashboard);

// Admin only routes
router.use('/users', requireRole('ADMIN'), userRoutes);
router.use('/reports', requireRole('ADMIN'), reportsRoutes);

export default router;
