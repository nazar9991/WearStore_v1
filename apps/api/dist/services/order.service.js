"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderService = exports.OrderService = void 0;
const client_1 = require("@prisma/client");
const prisma_js_1 = require("../config/prisma.js");
const orderNumber_js_1 = require("../utils/orderNumber.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const cart_service_js_1 = require("./cart.service.js");
class OrderService {
    async createOrder(userId, input) {
        const cart = await cart_service_js_1.cartService.getCart(userId);
        if (cart.items.length === 0) {
            throw new errorHandler_js_1.AppError('Кошик порожній', 400);
        }
        // Validate stock
        for (const item of cart.items) {
            if (item.variant.stock < item.quantity) {
                throw new errorHandler_js_1.AppError(`Недостатньо товару "${item.product.name}" (${item.variant.size}, ${item.variant.color})`, 400);
            }
        }
        let address = null;
        let addressSnapshot = {};
        if (input.addressId) {
            address = await prisma_js_1.prisma.address.findFirst({
                where: { id: input.addressId, userId },
            });
            if (!address) {
                throw new errorHandler_js_1.AppError('Адресу не знайдено', 404);
            }
            addressSnapshot = {
                city: address.city,
                street: address.street,
                building: address.building,
                apartment: address.apartment,
                postalCode: address.postalCode,
            };
        }
        let discount = new client_1.Prisma.Decimal(0);
        let promoCodeUsed = null;
        if (input.promoCode) {
            const promo = await cart_service_js_1.cartService.applyPromoCode(userId, input.promoCode);
            discount = promo.discount;
            promoCodeUsed = promo.code;
        }
        const shippingCost = this.calculateShippingCost(input.deliveryMethod, cart.subtotal);
        const totalAmount = cart.subtotal.sub(discount).add(shippingCost);
        const order = await prisma_js_1.prisma.$transaction(async (tx) => {
            // Generate order number inside transaction to avoid race conditions
            const orderNumber = await (0, orderNumber_js_1.generateOrderNumber)(tx);
            // Create order
            const order = await tx.order.create({
                data: {
                    orderNumber,
                    userId,
                    status: client_1.OrderStatus.PENDING,
                    subtotal: cart.subtotal,
                    discountAmount: discount,
                    shippingCost,
                    totalAmount,
                    promoCode: promoCodeUsed,
                    deliveryMethod: input.deliveryMethod,
                    addressId: input.addressId,
                    addressSnapshot,
                    paymentMethod: input.paymentMethod,
                    customerNote: input.customerNote,
                    items: {
                        create: cart.items.map((item) => ({
                            productSnapshot: {
                                productId: item.product.id,
                                name: item.product.name,
                                slug: item.product.slug,
                                image: item.product.image,
                                size: item.variant.size,
                                color: item.variant.color,
                            },
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            totalPrice: item.totalPrice,
                        })),
                    },
                    statusHistory: {
                        create: {
                            toStatus: client_1.OrderStatus.PENDING,
                            comment: 'Замовлення створено',
                        },
                    },
                },
                include: {
                    items: true,
                },
            });
            // Decrease stock
            for (const item of cart.items) {
                await tx.productVariant.update({
                    where: { id: item.variant.id },
                    data: {
                        stock: { decrement: item.quantity },
                    },
                });
            }
            // Increment promo code usage
            if (promoCodeUsed) {
                await tx.promoCode.update({
                    where: { code: promoCodeUsed },
                    data: { usedCount: { increment: 1 } },
                });
            }
            // Clear cart
            const cartData = await tx.cart.findUnique({ where: { userId } });
            if (cartData) {
                await tx.cartItem.deleteMany({ where: { cartId: cartData.id } });
            }
            return order;
        });
        return order;
    }
    async getUserOrders(userId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            prisma_js_1.prisma.order.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip: offset,
                take: limit,
                include: {
                    items: true,
                },
            }),
            prisma_js_1.prisma.order.count({ where: { userId } }),
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
    async getOrderById(userId, orderId) {
        const order = await prisma_js_1.prisma.order.findFirst({
            where: { id: orderId, userId },
            include: {
                items: true,
                address: true,
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
    async cancelOrder(userId, orderId) {
        const order = await prisma_js_1.prisma.order.findFirst({
            where: { id: orderId, userId },
            include: { items: true },
        });
        if (!order) {
            throw new errorHandler_js_1.AppError('Замовлення не знайдено', 404);
        }
        if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
            throw new errorHandler_js_1.AppError('Замовлення вже неможливо скасувати', 400);
        }
        await prisma_js_1.prisma.$transaction(async (tx) => {
            await tx.order.update({
                where: { id: orderId },
                data: {
                    status: client_1.OrderStatus.CANCELLED,
                    statusHistory: {
                        create: {
                            fromStatus: order.status,
                            toStatus: client_1.OrderStatus.CANCELLED,
                            comment: 'Скасовано клієнтом',
                        },
                    },
                },
            });
            // Restore stock
            for (const item of order.items) {
                const snapshot = item.productSnapshot;
                const variant = await tx.productVariant.findFirst({
                    where: {
                        product: { id: snapshot.productId },
                        size: snapshot.size,
                        color: snapshot.color,
                    },
                });
                if (variant) {
                    await tx.productVariant.update({
                        where: { id: variant.id },
                        data: { stock: { increment: item.quantity } },
                    });
                }
            }
        });
        return this.getOrderById(userId, orderId);
    }
    calculateShippingCost(method, subtotal) {
        // Free shipping for orders over 2000 UAH
        if (subtotal.gte(2000)) {
            return new client_1.Prisma.Decimal(0);
        }
        switch (method) {
            case 'NOVA_POSHTA_WAREHOUSE':
                return new client_1.Prisma.Decimal(70);
            case 'NOVA_POSHTA_COURIER':
                return new client_1.Prisma.Decimal(120);
            case 'UKRPOSHTA':
                return new client_1.Prisma.Decimal(50);
            default:
                return new client_1.Prisma.Decimal(70);
        }
    }
}
exports.OrderService = OrderService;
exports.orderService = new OrderService();
//# sourceMappingURL=order.service.js.map