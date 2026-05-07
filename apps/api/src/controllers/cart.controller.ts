import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { cartService } from '../services/cart.service.js';

const addItemSchema = z.object({
  variantId: z.string(),
  quantity: z.number().int().positive().default(1),
});

const updateQuantitySchema = z.object({
  quantity: z.number().int().min(0),
});

export const getCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cart = await cartService.getCart(req.user!.userId);
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

export const addItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { variantId, quantity } = addItemSchema.parse(req.body);
    const cart = await cartService.addItem(req.user!.userId, variantId, quantity);
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

export const updateItemQuantity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { quantity } = updateQuantitySchema.parse(req.body);
    const cart = await cartService.updateItemQuantity(req.user!.userId, id, quantity);
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

export const removeItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const cart = await cartService.removeItem(req.user!.userId, id);
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cart = await cartService.clearCart(req.user!.userId);
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

export const applyPromoCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = z.object({ code: z.string() }).parse(req.body);
    const result = await cartService.applyPromoCode(req.user!.userId, code);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
