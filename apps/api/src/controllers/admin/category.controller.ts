import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { adminCategoryService } from '../../services/admin/category.service.js';

const createCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  parentId: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

const reorderSchema = z.array(
  z.object({
    id: z.string(),
    sortOrder: z.number().int(),
  })
);

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await adminCategoryService.getCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createCategorySchema.parse(req.body);
    const category = await adminCategoryService.createCategory(input);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const input = createCategorySchema.partial().parse(req.body);
    const category = await adminCategoryService.updateCategory(id, input);
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await adminCategoryService.deleteCategory(id);
    res.json({ success: true, message: 'Категорію видалено' });
  } catch (error) {
    next(error);
  }
};

export const reorderCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = reorderSchema.parse(req.body);
    await adminCategoryService.reorderCategories(orders);
    res.json({ success: true, message: 'Порядок категорій оновлено' });
  } catch (error) {
    next(error);
  }
};
