"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminReportsService = exports.AdminReportsService = void 0;
const prisma_js_1 = require("../../config/prisma.js");
class AdminReportsService {
    async getDashboard() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const yearStart = new Date(today.getFullYear(), 0, 1);
        const [totalOrders, todayOrders, monthOrders, pendingOrders, totalRevenue, monthRevenue, totalProducts, lowStockProducts, totalUsers, newUsersThisMonth,] = await Promise.all([
            prisma_js_1.prisma.order.count(),
            prisma_js_1.prisma.order.count({ where: { createdAt: { gte: today } } }),
            prisma_js_1.prisma.order.count({ where: { createdAt: { gte: monthStart } } }),
            prisma_js_1.prisma.order.count({ where: { status: 'PENDING' } }),
            prisma_js_1.prisma.order.aggregate({
                where: { paymentStatus: 'PAID' },
                _sum: { totalAmount: true },
            }),
            prisma_js_1.prisma.order.aggregate({
                where: { paymentStatus: 'PAID', createdAt: { gte: monthStart } },
                _sum: { totalAmount: true },
            }),
            prisma_js_1.prisma.product.count({ where: { isActive: true } }),
            prisma_js_1.prisma.productVariant.count({ where: { stock: { lt: 10 } } }),
            prisma_js_1.prisma.user.count({ where: { role: 'CLIENT' } }),
            prisma_js_1.prisma.user.count({
                where: { role: 'CLIENT', createdAt: { gte: monthStart } },
            }),
        ]);
        return {
            orders: {
                total: totalOrders,
                today: todayOrders,
                thisMonth: monthOrders,
                pending: pendingOrders,
            },
            revenue: {
                total: totalRevenue._sum.totalAmount || 0,
                thisMonth: monthRevenue._sum.totalAmount || 0,
            },
            products: {
                total: totalProducts,
                lowStock: lowStockProducts,
            },
            users: {
                total: totalUsers,
                newThisMonth: newUsersThisMonth,
            },
        };
    }
    async getSalesReport(startDate, endDate) {
        const orders = await prisma_js_1.prisma.order.findMany({
            where: {
                paymentStatus: 'PAID',
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: { createdAt: 'asc' },
            select: {
                createdAt: true,
                totalAmount: true,
                discountAmount: true,
            },
        });
        // Group by date
        const salesByDate = orders.reduce((acc, order) => {
            const date = order.createdAt.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = { revenue: 0, orders: 0, discount: 0 };
            }
            acc[date].revenue += order.totalAmount.toNumber();
            acc[date].orders += 1;
            acc[date].discount += order.discountAmount.toNumber();
            return acc;
        }, {});
        return Object.entries(salesByDate).map(([date, data]) => ({
            date,
            ...data,
        }));
    }
    async getTopProducts(limit = 10, startDate, endDate) {
        const where = {};
        if (startDate || endDate) {
            where.order = {
                createdAt: {
                    ...(startDate && { gte: startDate }),
                    ...(endDate && { lte: endDate }),
                },
                paymentStatus: 'PAID',
            };
        }
        const orderItems = await prisma_js_1.prisma.orderItem.groupBy({
            by: ['productSnapshot'],
            where,
            _sum: { quantity: true, totalPrice: true },
            orderBy: { _sum: { totalPrice: 'desc' } },
            take: limit,
        });
        return orderItems.map((item) => {
            const snapshot = item.productSnapshot;
            return {
                productId: snapshot.productId,
                name: snapshot.name,
                image: snapshot.image,
                soldQuantity: item._sum.quantity || 0,
                revenue: item._sum.totalPrice || 0,
            };
        });
    }
    async getLowStockProducts(threshold = 10, limit = 50) {
        return prisma_js_1.prisma.productVariant.findMany({
            where: { stock: { lt: threshold } },
            orderBy: { stock: 'asc' },
            take: limit,
            include: {
                product: {
                    select: { id: true, name: true, slug: true, sku: true },
                },
            },
        });
    }
    async getCustomersReport(startDate, endDate) {
        const where = { role: 'CLIENT' };
        if (startDate || endDate) {
            where.createdAt = {
                ...(startDate && { gte: startDate }),
                ...(endDate && { lte: endDate }),
            };
        }
        const [totalCustomers, newCustomers, topCustomers] = await Promise.all([
            prisma_js_1.prisma.user.count({ where: { role: 'CLIENT' } }),
            prisma_js_1.prisma.user.count({ where }),
            prisma_js_1.prisma.order.groupBy({
                by: ['userId'],
                where: { paymentStatus: 'PAID' },
                _sum: { totalAmount: true },
                _count: true,
                orderBy: { _sum: { totalAmount: 'desc' } },
                take: 10,
            }),
        ]);
        const topCustomerDetails = await Promise.all(topCustomers.map(async (tc) => {
            const user = await prisma_js_1.prisma.user.findUnique({
                where: { id: tc.userId },
                select: { id: true, email: true, firstName: true, lastName: true },
            });
            return {
                user,
                ordersCount: tc._count,
                totalSpent: tc._sum.totalAmount || 0,
            };
        }));
        return {
            total: totalCustomers,
            new: newCustomers,
            topCustomers: topCustomerDetails,
        };
    }
}
exports.AdminReportsService = AdminReportsService;
exports.adminReportsService = new AdminReportsService();
//# sourceMappingURL=reports.service.js.map