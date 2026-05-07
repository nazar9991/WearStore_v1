import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { adminReportsService } from '../../services/admin/reports.service.js';

const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dashboard = await adminReportsService.getDashboard();
    res.json({ success: true, data: dashboard });
  } catch (error) {
    next(error);
  }
};

export const getSalesReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = dateRangeSchema.parse(req.query);

    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    const report = await adminReportsService.getSalesReport(
      startDate || defaultStartDate,
      endDate || new Date()
    );

    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

export const getTopProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const { startDate, endDate } = dateRangeSchema.parse(req.query);

    const products = await adminReportsService.getTopProducts(limit, startDate, endDate);
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

export const getLowStockProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const threshold = req.query.threshold ? parseInt(req.query.threshold as string, 10) : 10;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

    const products = await adminReportsService.getLowStockProducts(threshold, limit);
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

export const getCustomersReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = dateRangeSchema.parse(req.query);
    const report = await adminReportsService.getCustomersReport(startDate, endDate);
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};
