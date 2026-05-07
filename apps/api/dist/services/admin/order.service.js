"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOrderService = exports.AdminOrderService = void 0;
const prisma_js_1 = require("../../config/prisma.js");
const errorHandler_js_1 = require("../../middleware/errorHandler.js");
class AdminOrderService {
    async getOrders(input) {
        const page = input.page || 1;
        const limit = input.limit || 20;
        const offset = (page - 1) * limit;
        const where = {};
        if (input.status) {
            where.status = input.status;
        }
        if (input.paymentStatus) {
            where.paymentStatus = input.paymentStatus;
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
            prisma_js_1.prisma.order.findMany({
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
            prisma_js_1.prisma.order.count({ where }),
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
    async getOrderById(id) {
        const order = await prisma_js_1.prisma.order.findUnique({
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
            throw new errorHandler_js_1.AppError('Замовлення не знайдено', 404);
        }
        return order;
    }
    async updateStatus(orderId, newStatus, managerId, comment) {
        const order = await prisma_js_1.prisma.order.findUnique({
            where: { id: orderId },
        });
        if (!order) {
            throw new errorHandler_js_1.AppError('Замовлення не знайдено', 404);
        }
        const validTransitions = {
            PENDING: ['CONFIRMED', 'CANCELLED'],
            CONFIRMED: ['PROCESSING', 'CANCELLED'],
            PROCESSING: ['SHIPPED', 'CANCELLED'],
            SHIPPED: ['DELIVERED'],
            DELIVERED: ['REFUNDED'],
            CANCELLED: [],
            REFUNDED: [],
        };
        if (!validTransitions[order.status].includes(newStatus)) {
            throw new errorHandler_js_1.AppError(`Неможливо змінити статус з "${order.status}" на "${newStatus}"`, 400);
        }
        const updated = await prisma_js_1.prisma.order.update({
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
    async addTrackingNumber(orderId, trackingNumber) {
        const order = await prisma_js_1.prisma.order.findUnique({
            where: { id: orderId },
        });
        if (!order) {
            throw new errorHandler_js_1.AppError('Замовлення не знайдено', 404);
        }
        return prisma_js_1.prisma.order.update({
            where: { id: orderId },
            data: { trackingNumber },
        });
    }
    async addManagerNote(orderId, note) {
        const order = await prisma_js_1.prisma.order.findUnique({
            where: { id: orderId },
        });
        if (!order) {
            throw new errorHandler_js_1.AppError('Замовлення не знайдено', 404);
        }
        return prisma_js_1.prisma.order.update({
            where: { id: orderId },
            data: { managerNote: note },
        });
    }
}
exports.AdminOrderService = AdminOrderService;
exports.adminOrderService = new AdminOrderService();
//# sourceMappingURL=order.service.js.map