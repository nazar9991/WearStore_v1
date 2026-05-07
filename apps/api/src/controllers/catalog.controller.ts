import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Size } from '@prisma/client';
import { catalogService } from '../services/catalog.service.js';

const getProductsSchema = z.object({
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sizes: z.string().optional().transform((s) => s?.split(',') as Size[] | undefined),
  colors: z.string().optional().transform((s) => s?.split(',')),
  inStock: z.coerce.boolean().optional(),
  onSale: z.coerce.boolean().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'popular']).optional(),
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().max(48).optional(),
});

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await catalogService.getCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const category = await catalogService.getCategoryBySlug(slug);
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = getProductsSchema.parse(req.query);
    const result = await catalogService.getProducts(input);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const product = await catalogService.getProductBySlug(slug);
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 8;
    const products = await catalogService.getFeaturedProducts(limit);
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

export const searchProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = (req.query.q as string) || '';
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 12;

    const result = await catalogService.searchProducts(query, page, limit);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
