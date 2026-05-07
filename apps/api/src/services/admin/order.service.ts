import { Prisma, OrderStatus } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

interface GetOrdersInput {
  status?: OrderStatus;
  paymentStatus?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export class AdminOrderService {
  async getOrders(input: GetOrdersInput) {
    const page = input.page || 1;
    const limit = input.limit || 20;
    const offset = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (input.status) {
      where.status = input.status;
    }

    if (input.paymentStatus) {
      where.paymentStatus = input.paymentStatus as any;
    }

    if (input.search) {
      where.OR = [
        { orderNumber: { contains: input.search, mode: 'insensitive' } },
        { user: { email: { contains: input.search, mode: 'insensitive' } } },
        { user: { firstName: { contains: input.search, mode: 'insensitive' } } },
        { user: { lastName: { contains: input.search, mode: 'insensitive' } } },
      ];
    }

    if (input.startDate || input.endDate) {
      where.createdAt = {
        ...(input.startDate && { gte: input.startDate }),
        ...(input.endDate && { lte: input.endDate }),
      };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
          items: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async getOrderById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        address: true,
        items: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      throw new AppError('Замовлення не знайдено', 404);
    }

    return order;
  }

  async updateStatus(orderId: string, newStatus: OrderStatus, managerId: string, comment?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new AppError('Замовлення не знайдено', 404);
    }

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: ['REFUNDED'],
      CANCELLED: [],
      REFUNDED: [],
    };

    if (!validTransitions[order.status].includes(newStatus)) {
      throw new AppError(
        `Неможливо змінити статус з "${order.status}" на "${newStatus}"`,
        400
      );
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        statusHistory: {
          create: {
            fromStatus: order.status,
            toStatus: newStatus,
            comment,
            managerId,
          },
        },
      },
      include: {
        user: {
          select: { email: true, firstName: true },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    // TODO: Send email notification

    return updated;
  }

  async addTrackingNumber(orderId: string, trackingNumber: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new AppError('Замовлення не знайдено', 404);
    }

    return prisma.order.update({
      where: { id: orderId },
      data: { trackingNumber },
    });
  }

  async addManagerNote(orderId: string, note: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new AppError('Замовлення не знайдено', 404);
    }

    return prisma.order.update({
      where: { id: orderId },
      data: { managerNote: note },
    });
  }
}

export const adminOrderService = new AdminOrderService();
