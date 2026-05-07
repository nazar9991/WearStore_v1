"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartService = exports.CartService = void 0;
const client_1 = require("@prisma/client");
const prisma_js_1 = require("../config/prisma.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
class CartService {
    async getCart(userId) {
        let cart = await prisma_js_1.prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                product: {
                                    include: {
                                        images: {
                                            where: { isPrimary: true },
                                            take: 1,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!cart) {
            cart = await prisma_js_1.prisma.cart.create({
                data: { userId },
                include: {
                    items: {
                        include: {
                            variant: {
                                include: {
                                    product: {
                                        include: {
                                            images: {
                                                where: { isPrimary: true },
                                                take: 1,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
        }
        const items = cart.items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            variant: {
                id: item.variant.id,
                size: item.variant.size,
                color: item.variant.color,
                stock: item.variant.stock,
            },
            product: {
                id: item.variant.product.id,
                name: item.variant.product.name,
                slug: item.variant.product.slug,
                basePrice: item.variant.product.basePrice,
                salePrice: item.variant.product.salePrice,
                image: item.variant.product.images[0]?.url || null,
            },
            unitPrice: item.variant.product.salePrice || item.variant.product.basePrice,
            totalPrice: new client_1.Prisma.Decimal((item.variant.product.salePrice || item.variant.product.basePrice).toNumber() +
                item.variant.priceAddon.toNumber()).mul(item.quantity),
        }));
        const subtotal = items.reduce((sum, item) => sum.add(item.totalPrice), new client_1.Prisma.Decimal(0));
        return {
            id: cart.id,
            items,
            subtotal,
            itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        };
    }
    async addItem(userId, variantId, quantity) {
        const variant = await prisma_js_1.prisma.productVariant.findUnique({
            where: { id: variantId },
            include: { product: true },
        });
        if (!variant) {
            throw new errorHandler_js_1.AppError('Варіант товару не знайдено', 404);
        }
        if (!variant.product.isActive) {
            throw new errorHandler_js_1.AppError('Товар недоступний', 400);
        }
        if (variant.stock < quantity) {
            throw new errorHandler_js_1.AppError('Недостатньо товару на складі', 400);
        }
        let cart = await prisma_js_1.prisma.cart.findUnique({ where: { userId } });
        if (!cart) {
            cart = await prisma_js_1.prisma.cart.create({ data: { userId } });
        }
        const existingItem = await prisma_js_1.prisma.cartItem.findUnique({
            where: {
                cartId_variantId: {
                    cartId: cart.id,
                    variantId,
                },
            },
        });
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (variant.stock < newQuantity) {
                throw new errorHandler_js_1.AppError('Недостатньо товару на складі', 400);
            }
            await prisma_js_1.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQuantity },
            });
        }
        else {
            await prisma_js_1.prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    variantId,
                    quantity,
                },
            });
        }
        return this.getCart(userId);
    }
    async updateItemQuantity(userId, itemId, quantity) {
        const cart = await prisma_js_1.prisma.cart.findUnique({ where: { userId } });
        if (!cart) {
            throw new errorHandler_js_1.AppError('Кошик не знайдено', 404);
        }
        const item = await prisma_js_1.prisma.cartItem.findFirst({
            where: {
                id: itemId,
                cartId: cart.id,
            },
            include: { variant: true },
        });
        if (!item) {
            throw new errorHandler_js_1.AppError('Товар не знайдено в кошику', 404);
        }
        if (quantity <= 0) {
            await prisma_js_1.prisma.cartItem.delete({ where: { id: itemId } });
        }
        else {
            if (item.variant.stock < quantity) {
                throw new errorHandler_js_1.AppError('Недостатньо товару на складі', 400);
            }
            await prisma_js_1.prisma.cartItem.update({
                where: { id: itemId },
                data: { quantity },
            });
        }
        return this.getCart(userId);
    }
    async removeItem(userId, itemId) {
        const cart = await prisma_js_1.prisma.cart.findUnique({ where: { userId } });
        if (!cart) {
            throw new errorHandler_js_1.AppError('Кошик не знайдено', 404);
        }
        const item = await prisma_js_1.prisma.cartItem.findFirst({
            where: {
                id: itemId,
                cartId: cart.id,
            },
        });
        if (!item) {
            throw new errorHandler_js_1.AppError('Товар не знайдено в кошику', 404);
        }
        await prisma_js_1.prisma.cartItem.delete({ where: { id: itemId } });
        return this.getCart(userId);
    }
    async clearCart(userId) {
        const cart = await prisma_js_1.prisma.cart.findUnique({ where: { userId } });
        if (cart) {
            await prisma_js_1.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        }
        return this.getCart(userId);
    }
    async applyPromoCode(userId, code) {
        const promoCode = await prisma_js_1.prisma.promoCode.findUnique({
            where: { code: code.toUpperCase() },
        });
        if (!promoCode) {
            throw new errorHandler_js_1.AppError('Промокод не знайдено', 404);
        }
        if (!promoCode.isActive) {
            throw new errorHandler_js_1.AppError('Промокод неактивний', 400);
        }
        const now = new Date();
        if (promoCode.startsAt && promoCode.startsAt > now) {
            throw new errorHandler_js_1.AppError('Промокод ще не діє', 400);
        }
        if (promoCode.expiresAt && promoCode.expiresAt < now) {
            throw new errorHandler_js_1.AppError('Термін дії промокоду закінчився', 400);
        }
        if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
            throw new errorHandler_js_1.AppError('Промокод вичерпано', 400);
        }
        const cart = await this.getCart(userId);
        if (promoCode.minOrderAmount && cart.subtotal.lessThan(promoCode.minOrderAmount)) {
            throw new errorHandler_js_1.AppError(`Мінімальна сума замовлення для цього промокоду: ${promoCode.minOrderAmount} грн`, 400);
        }
        let discount;
        if (promoCode.type === 'PERCENTAGE') {
            discount = cart.subtotal.mul(promoCode.value).div(100);
        }
        else {
            discount = promoCode.value;
        }
        return {
            code: promoCode.code,
            type: promoCode.type,
            value: promoCode.value,
            discount,
            subtotal: cart.subtotal,
            total: cart.subtotal.sub(discount),
        };
    }
}
exports.CartService = CartService;
exports.cartService = new CartService();
//# sourceMappingURL=cart.service.js.map