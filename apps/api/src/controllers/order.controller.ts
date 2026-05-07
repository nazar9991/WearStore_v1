import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { DeliveryMethod, PaymentMethod } from '@prisma/client';
import { orderService } from '../services/order.service.js';

const createOrderSchema = z.object({
  addressId: z.string().optional(),
  deliveryMethod: z.nativeEnum(DeliveryMethod),
  paymentMethod: z.nativeEnum(PaymentMethod),
  promoCode: z.string().optional(),
  customerNote: z.string().max(500).optional(),
});

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createOrderSchema.parse(req.body);
    const order = await orderService.createOrder(req.user!.userId, input);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

    const result = await orderService.getUserOrders(req.user!.userId, page, limit);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(req.user!.userId, id);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await orderService.cancelOrder(req.user!.userId, id);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
