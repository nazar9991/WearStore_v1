import { Router } from 'express';
import * as categoryController from '../../controllers/admin/category.controller.js';

const router = Router();

router.get('/', categoryController.getCategories);
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);
router.patch('/reorder', categoryController.reorderCategories);

export default router;
