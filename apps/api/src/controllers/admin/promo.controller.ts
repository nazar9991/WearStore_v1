import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PromoCodeType } from '@prisma/client';
import { adminPromoService } from '../../services/admin/promo.service.js';

const createPromoSchema = z.object({
  code: z.string().min(3).max(20),
  type: z.nativeEnum(PromoCodeType),
  value: z.number().positive(),
  minOrderAmount: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional(),
  startsAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
});

export const getPromoCodes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const result = await adminPromoService.getPromoCodes(page, limit);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const createPromoCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createPromoSchema.parse(req.body);
    const promoCode = await adminPromoService.createPromoCode(input);
    res.status(201).json({ success: true, data: promoCode });
  } catch (error) {
    next(error);
  }
};

export const updatePromoCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const input = createPromoSchema.partial().parse(req.body);
    const promoCode = await adminPromoService.updatePromoCode(id, input);
    res.json({ success: true, data: promoCode });
  } catch (error) {
    next(error);
  }
};

export const deletePromoCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await adminPromoService.deletePromoCode(id);
    res.json({ success: true, message: 'Промокод видалено' });
  } catch (error) {
    next(error);
  }
};
