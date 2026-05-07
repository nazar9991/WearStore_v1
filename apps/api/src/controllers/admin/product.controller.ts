import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Size } from '@prisma/client';
import { adminProductService } from '../../services/admin/product.service.js';
import { processAndSaveImage, deleteImageFile } from '../../utils/upload.js';

const createProductSchema = z.object({
  sku: z.string().min(1).optional(),
  name: z.string().min(1),
  description: z.string().min(1),
  shortDescription: z.string().optional(),
  categoryId: z.string(),
  basePrice: z.number().positive(),
  salePrice: z.number().positive().optional().nullable(),
  material: z.string().optional(),
  careInstructions: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

const createVariantSchema = z.object({
  size: z.nativeEnum(Size),
  color: z.string().min(1),
  stock: z.number().int().min(0),
  priceAddon: z.number().optional(),
});

export const generateSku = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categoryId = req.query.categoryId as string | undefined;
    const sku = await adminProductService.generateSku(categoryId);
    res.json({ success: true, data: { sku } });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const search = req.query.search as string | undefined;

    const result = await adminProductService.getProducts(page, limit, search);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await adminProductService.getProductById(id);
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createProductSchema.parse(req.body);
    const product = await adminProductService.createProduct(input);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const input = createProductSchema.partial().parse(req.body);
    const product = await adminProductService.updateProduct(id, input);
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await adminProductService.deleteProduct(id);
    res.json({ success: true, message: 'Товар видалено' });
  } catch (error) {
    next(error);
  }
};

export const addImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { url, altText, isPrimary } = z
      .object({
        url: z.string().url(),
        altText: z.string().optional(),
        isPrimary: z.boolean().optional(),
      })
      .parse(req.body);

    const image = await adminProductService.addImage(id, url, altText, isPrimary);
    res.status(201).json({ success: true, data: image });
  } catch (error) {
    next(error);
  }
};

export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Файл не завантажено' });
    }

    const altText = req.body.altText || '';
    const isPrimary = req.body.isPrimary === 'true';

    // Process and save the uploaded image
    const processed = await processAndSaveImage(req.file);

    // Add image to product in database
    const image = await adminProductService.addImage(id, processed.url, altText, isPrimary);

    res.status(201).json({ success: true, data: image });
  } catch (error) {
    next(error);
  }
};

export const deleteImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, imageId } = req.params;

    // Get image URL before deletion to remove file
    const product = await adminProductService.getProductById(id);
    const image = product.images.find((img: any) => img.id === imageId);

    await adminProductService.deleteImage(id, imageId);

    // Delete file if it's a local upload
    if (image?.url) {
      await deleteImageFile(image.url);
    }

    res.json({ success: true, message: 'Зображення видалено' });
  } catch (error) {
    next(error);
  }
};

export const addVariant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const input = createVariantSchema.parse(req.body);
    const variant = await adminProductService.addVariant(id, input);
    res.status(201).json({ success: true, data: variant });
  } catch (error) {
    next(error);
  }
};

export const updateVariant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, variantId } = req.params;
    const input = createVariantSchema.partial().parse(req.body);
    const variant = await adminProductService.updateVariant(id, variantId, input);
    res.json({ success: true, data: variant });
  } catch (error) {
    next(error);
  }
};

export const deleteVariant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, variantId } = req.params;
    await adminProductService.deleteVariant(id, variantId);
    res.json({ success: true, message: 'Варіант видалено' });
  } catch (error) {
    next(error);
  }
};
