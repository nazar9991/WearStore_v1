import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as profileController from '../controllers/profile.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', profileController.getProfile);
router.patch('/', profileController.updateProfile);
router.patch('/password', profileController.changePassword);
router.get('/addresses', profileController.getAddresses);
router.post('/addresses', profileController.addAddress);
router.patch('/addresses/:id', profileController.updateAddress);
router.delete('/addresses/:id', profileController.deleteAddress);

export default router;
