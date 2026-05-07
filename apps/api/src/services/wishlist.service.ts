import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export class WishlistService {
  async getWishlist(userId: string) {
    const items = await prisma.wishlistItem.findMany({
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

  async addToWishlist(userId: string, productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true },
    });

    if (!product) {
      throw new AppError('Товар не знайдено', 404);
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existing) {
      return this.getWishlist(userId);
    }

    await prisma.wishlistItem.create({
      data: { userId, productId },
    });

    return this.getWishlist(userId);
  }

  async removeFromWishlist(userId: string, productId: string) {
    await prisma.wishlistItem.deleteMany({
      where: { userId, productId },
    });

    return this.getWishlist(userId);
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const item = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    return !!item;
  }
}

export const wishlistService = new WishlistService();
