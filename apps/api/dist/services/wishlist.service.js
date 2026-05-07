"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wishlistService = exports.WishlistService = void 0;
const prisma_js_1 = require("../config/prisma.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
class WishlistService {
    async getWishlist(userId) {
        const items = await prisma_js_1.prisma.wishlistItem.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                product: {
                    include: {
                        category: {
                            select: { id: true, name: true, slug: true },
                        },
                        images: {
                            where: { isPrimary: true },
                            take: 1,
                        },
                        variants: {
                            select: { size: true, color: true, stock: true },
                        },
                    },
                },
            },
        });
        return items.map((item) => ({
            id: item.id,
            addedAt: item.createdAt,
            product: {
                id: item.product.id,
                name: item.product.name,
                slug: item.product.slug,
                basePrice: item.product.basePrice,
                salePrice: item.product.salePrice,
                image: item.product.images[0]?.url || null,
                category: item.product.category,
                inStock: item.product.variants.some((v) => v.stock > 0),
                variants: item.product.variants,
            },
        }));
    }
    async addToWishlist(userId, productId) {
        const product = await prisma_js_1.prisma.product.findUnique({
            where: { id: productId, isActive: true },
        });
        if (!product) {
            throw new errorHandler_js_1.AppError('Товар не знайдено', 404);
        }
        const existing = await prisma_js_1.prisma.wishlistItem.findUnique({
            where: {
                userId_productId: { userId, productId },
            },
        });
        if (existing) {
            return this.getWishlist(userId);
        }
        await prisma_js_1.prisma.wishlistItem.create({
            data: { userId, productId },
        });
        return this.getWishlist(userId);
    }
    async removeFromWishlist(userId, productId) {
        await prisma_js_1.prisma.wishlistItem.deleteMany({
            where: { userId, productId },
        });
        return this.getWishlist(userId);
    }
    async isInWishlist(userId, productId) {
        const item = await prisma_js_1.prisma.wishlistItem.findUnique({
            where: {
                userId_productId: { userId, productId },
            },
        });
        return !!item;
    }
}
exports.WishlistService = WishlistService;
exports.wishlistService = new WishlistService();
//# sourceMappingURL=wishlist.service.js.map