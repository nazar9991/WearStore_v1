import { Router } from 'express';
import * as productController from '../../controllers/admin/product.controller.js';
import { upload } from '../../utils/upload.js';

const router = Router();

router.get('/generate-sku', productController.generateSku);
router.get('/', productController.getProducts);
router.post('/', productController.createProduct);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

router.post('/:id/images', productController.addImage);
router.post('/:id/images/upload', upload.single('image'), productController.uploadImage);
router.delete('/:id/images/:imageId', productController.deleteImage);

router.post('/:id/variants', productController.addVariant);
router.patch('/:id/variants/:variantId', productController.updateVariant);
router.delete('/:id/variants/:variantId', productController.deleteVariant);

export default router;
