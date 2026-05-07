import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export class CartService {
  async getCart(userId: string) {
    let cart = await prisma.cart.findUnique({
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
      cart = await prisma.cart.create({
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
      totalPrice: new Prisma.Decimal(
        (item.variant.product.salePrice || item.variant.product.basePrice).toNumber() +
          item.variant.priceAddon.toNumber()
      ).mul(item.quantity),
    }));

    const subtotal = items.reduce(
      (sum, item) => sum.add(item.totalPrice),
      new Prisma.Decimal(0)
    );

    return {
      id: cart.id,
      items,
      subtotal,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }

  async addItem(userId: string, variantId: string, quantity: number) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (!variant) {
      throw new AppError('Варіант товару не знайдено', 404);
    }

    if (!variant.product.isActive) {
      throw new AppError('Товар недоступний', 400);
    }

    if (variant.stock < quantity) {
      throw new AppError('Недостатньо товару на складі', 400);
    }

    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    const existingItem = await prisma.cartItem.findUnique({
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
        throw new AppError('Недостатньо товару на складі', 400);
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId,
          quantity,
        },
      });
    }

    return this.getCart(userId);
  }

  async updateItemQuantity(userId: string, itemId: string, quantity: number) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      throw new AppError('Кошик не знайдено', 404);
    }

    const item = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
      include: { variant: true },
    });

    if (!item) {
      throw new AppError('Товар не знайдено в кошику', 404);
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      if (item.variant.stock < quantity) {
        throw new AppError('Недостатньо товару на складі', 400);
      }

      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    }

    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      throw new AppError('Кошик не знайдено', 404);
    }

    const item = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    if (!item) {
      throw new AppError('Товар не знайдено в кошику', 404);
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return this.getCart(userId);
  }

  async applyPromoCode(userId: string, code: string) {
    const promoCode = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promoCode) {
      throw new AppError('Промокод не знайдено', 404);
    }

    if (!promoCode.isActive) {
      throw new AppError('Промокод неактивний', 400);
    }

    const now = new Date();
    if (promoCode.startsAt && promoCode.startsAt > now) {
      throw new AppError('Промокод ще не діє', 400);
    }

    if (promoCode.expiresAt && promoCode.expiresAt < now) {
      throw new AppError('Термін дії промокоду закінчився', 400);
    }

    if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
      throw new AppError('Промокод вичерпано', 400);
    }

    const cart = await this.getCart(userId);

    if (promoCode.minOrderAmount && cart.subtotal.lessThan(promoCode.minOrderAmount)) {
      throw new AppError(
        `Мінімальна сума замовлення для цього промокоду: ${promoCode.minOrderAmount} грн`,
        400
      );
    }

    let discount: Prisma.Decimal;
    if (promoCode.type === 'PERCENTAGE') {
      discount = cart.subtotal.mul(promoCode.value).div(100);
    } else {
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

export const cartService = new CartService();
