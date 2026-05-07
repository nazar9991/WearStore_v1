import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { OrderStatus } from '@prisma/client';
import { adminOrderService } from '../../services/admin/order.service.js';

const getOrdersSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.string().optional(),
  search: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().optional(),
});

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = getOrdersSchema.parse(req.query);
    const result = await adminOrderService.getOrders(input);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await adminOrderService.getOrderById(id);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, comment } = z
      .object({
        status: z.nativeEnum(OrderStatus),
        comment: z.string().optional(),
      })
      .parse(req.body);

    const order = await adminOrderService.updateStatus(id, status, req.user!.userId, comment);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const addTrackingNumber = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { trackingNumber } = z
      .object({ trackingNumber: z.string().min(1) })
      .parse(req.body);

    const order = await adminOrderService.addTrackingNumber(id, trackingNumber);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const addManagerNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { note } = z.object({ note: z.string() }).parse(req.body);

    const order = await adminOrderService.addManagerNote(id, note);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
