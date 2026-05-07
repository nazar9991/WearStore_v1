import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { strictRateLimit } from '../middleware/rateLimit.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', strictRateLimit, authController.register);
router.post('/login', strictRateLimit, authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh', authController.refresh);
router.post('/forgot-password', strictRateLimit, authController.forgotPassword);
router.post('/reset-password', strictRateLimit, authController.resetPassword);
router.get('/me', authenticate, authController.getMe);

export default router;
