import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Prisma } from '@prisma/client';
import { AppError } from '../../src/middleware/errorHandler';

// Mock Prisma
vi.mock('../../src/config/prisma', () => ({
  prisma: {
    cart: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    cartItem: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    productVariant: {
      findUnique: vi.fn(),
    },
    promoCode: {
      findUnique: vi.fn(),
    },
  },
}));

import { CartService } from '../../src/services/cart.service';
import { prisma } from '../../src/config/prisma';

describe('CartService', () => {
  let cartService: CartService;

  beforeEach(() => {
    cartService = new CartService();
    vi.clearAllMocks();
  });

  describe('getCart', () => {
    it('should return existing cart with items', async () => {
      const mockCart = {
        id: 'cart-id',
        userId: 'user-id',
        items: [
          {
            id: 'item-1',
            quantity: 2,
            variant: {
              id: 'variant-1',
              size: 'M',
              color: 'Black',
              stock: 10,
              priceAddon: new Prisma.Decimal(0),
              product: {
                id: 'product-1',
                name: 'Test Product',
                slug: 'test-product',
                basePrice: new Prisma.Decimal(1000),
                salePrice: null,
                images: [{ url: 'image.jpg' }],
              },
            },
          },
        ],
      };

      vi.mocked(prisma.cart.findUnique).mockResolvedValue(mockCart as any);

      const result = await cartService.getCart('user-id');

      expect(result.id).toBe('cart-id');
      expect(result.items).toHaveLength(1);
      expect(result.itemCount).toBe(2);
    });

    it('should create new cart if not exists', async () => {
      vi.mocked(prisma.cart.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.cart.create).mockResolvedValue({
        id: 'new-cart-id',
        userId: 'user-id',
        items: [],
      } as any);

      const result = await cartService.getCart('user-id');

      expect(prisma.cart.create).toHaveBeenCalled();
      expect(result.items).toHaveLength(0);
      expect(result.itemCount).toBe(0);
    });
  });

  describe('addItem', () => {
    beforeEach(() => {
      // Default mock for getCart after add
      vi.mocked(prisma.cart.findUnique).mockResolvedValue({
        id: 'cart-id',
        userId: 'user-id',
        items: [],
      } as any);
    });

    it('should add item to cart', async () => {
      vi.mocked(prisma.productVariant.findUnique).mockResolvedValue({
        id: 'variant-1',
        stock: 10,
        product: { isActive: true },
      } as any);

      vi.mocked(prisma.cartItem.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.cartItem.create).mockResolvedValue({} as any);

      await cartService.addItem('user-id', 'variant-1', 2);

      expect(prisma.cartItem.create).toHaveBeenCalledWith({
        data: {
          cartId: 'cart-id',
          variantId: 'variant-1',
          quantity: 2,
        },
      });
    });

    it('should throw error if variant not found', async () => {
      vi.mocked(prisma.productVariant.findUnique).mockResolvedValue(null);

      await expect(cartService.addItem('user-id', 'invalid-variant', 1))
        .rejects.toThrow('Варіант товару не знайдено');
    });

    it('should throw error if product not active', async () => {
      vi.mocked(prisma.productVariant.findUnique).mockResolvedValue({
        id: 'variant-1',
        stock: 10,
        product: { isActive: false },
      } as any);

      await expect(cartService.addItem('user-id', 'variant-1', 1))
        .rejects.toThrow('Товар недоступний');
    });

    it('should throw error if not enough stock', async () => {
      vi.mocked(prisma.productVariant.findUnique).mockResolvedValue({
        id: 'variant-1',
        stock: 2,
        product: { isActive: true },
      } as any);

      await expect(cartService.addItem('user-id', 'variant-1', 5))
        .rejects.toThrow('Недостатньо товару на складі');
    });

    it('should update quantity if item already in cart', async () => {
      vi.mocked(prisma.productVariant.findUnique).mockResolvedValue({
        id: 'variant-1',
        stock: 10,
        product: { isActive: true },
      } as any);

      vi.mocked(prisma.cartItem.findUnique).mockResolvedValue({
        id: 'item-1',
        quantity: 2,
      } as any);

      vi.mocked(prisma.cartItem.update).mockResolvedValue({} as any);

      await cartService.addItem('user-id', 'variant-1', 3);

      expect(prisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        data: { quantity: 5 }, // 2 + 3
      });
    });
  });

  describe('updateItemQuantity', () => {
    it('should update item quantity', async () => {
      vi.mocked(prisma.cart.findUnique).mockResolvedValue({
        id: 'cart-id',
        userId: 'user-id',
        items: [],
      } as any);

      vi.mocked(prisma.cartItem.findFirst).mockResolvedValue({
        id: 'item-1',
        quantity: 2,
        variant: { stock: 10 },
      } as any);

      vi.mocked(prisma.cartItem.update).mockResolvedValue({} as any);

      await cartService.updateItemQuantity('user-id', 'item-1', 5);

      expect(prisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        data: { quantity: 5 },
      });
    });

    it('should delete item if quantity is 0', async () => {
      vi.mocked(prisma.cart.findUnique).mockResolvedValue({
        id: 'cart-id',
        userId: 'user-id',
        items: [],
      } as any);

      vi.mocked(prisma.cartItem.findFirst).mockResolvedValue({
        id: 'item-1',
        quantity: 2,
        variant: { stock: 10 },
      } as any);

      vi.mocked(prisma.cartItem.delete).mockResolvedValue({} as any);

      await cartService.updateItemQuantity('user-id', 'item-1', 0);

      expect(prisma.cartItem.delete).toHaveBeenCalledWith({
        where: { id: 'item-1' },
      });
    });

    it('should throw error if item not found', async () => {
      vi.mocked(prisma.cart.findUnique).mockResolvedValue({
        id: 'cart-id',
        userId: 'user-id',
        items: [],
      } as any);

      vi.mocked(prisma.cartItem.findFirst).mockResolvedValue(null);

      await expect(cartService.updateItemQuantity('user-id', 'invalid-item', 5))
        .rejects.toThrow('Товар не знайдено в кошику');
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', async () => {
      vi.mocked(prisma.cart.findUnique).mockResolvedValue({
        id: 'cart-id',
        userId: 'user-id',
        items: [],
      } as any);

      vi.mocked(prisma.cartItem.findFirst).mockResolvedValue({
        id: 'item-1',
      } as any);

      vi.mocked(prisma.cartItem.delete).mockResolvedValue({} as any);

      await cartService.removeItem('user-id', 'item-1');

      expect(prisma.cartItem.delete).toHaveBeenCalledWith({
        where: { id: 'item-1' },
      });
    });

    it('should throw error if cart not found', async () => {
      vi.mocked(prisma.cart.findUnique).mockResolvedValue(null);

      await expect(cartService.removeItem('user-id', 'item-1'))
        .rejects.toThrow('Кошик не знайдено');
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', async () => {
      vi.mocked(prisma.cart.findUnique).mockResolvedValue({
        id: 'cart-id',
        userId: 'user-id',
        items: [],
      } as any);

      vi.mocked(prisma.cartItem.deleteMany).mockResolvedValue({ count: 5 });

      await cartService.clearCart('user-id');

      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { cartId: 'cart-id' },
      });
    });
  });

  describe('applyPromoCode', () => {
    beforeEach(() => {
      // Mock getCart
      vi.spyOn(cartService, 'getCart').mockResolvedValue({
        id: 'cart-id',
        items: [],
        subtotal: new Prisma.Decimal(2000),
        itemCount: 2,
      } as any);
    });

    it('should apply percentage promo code', async () => {
      vi.mocked(prisma.promoCode.findUnique).mockResolvedValue({
        code: 'SALE20',
        type: 'PERCENTAGE',
        value: new Prisma.Decimal(20),
        isActive: true,
        minOrderAmount: new Prisma.Decimal(1000),
        usedCount: 0,
        maxUses: 100,
        startsAt: null,
        expiresAt: null,
      } as any);

      const result = await cartService.applyPromoCode('user-id', 'SALE20');

      expect(result.code).toBe('SALE20');
      expect(result.discount.toNumber()).toBe(400); // 20% of 2000
    });

    it('should apply fixed amount promo code', async () => {
      vi.mocked(prisma.promoCode.findUnique).mockResolvedValue({
        code: 'SAVE100',
        type: 'FIXED_AMOUNT',
        value: new Prisma.Decimal(100),
        isActive: true,
        minOrderAmount: null,
        usedCount: 0,
        maxUses: null,
        startsAt: null,
        expiresAt: null,
      } as any);

      const result = await cartService.applyPromoCode('user-id', 'SAVE100');

      expect(result.discount.toNumber()).toBe(100);
    });

    it('should throw error if promo code not found', async () => {
      vi.mocked(prisma.promoCode.findUnique).mockResolvedValue(null);

      await expect(cartService.applyPromoCode('user-id', 'INVALID'))
        .rejects.toThrow('Промокод не знайдено');
    });

    it('should throw error if promo code is inactive', async () => {
      vi.mocked(prisma.promoCode.findUnique).mockResolvedValue({
        code: 'INACTIVE',
        isActive: false,
      } as any);

      await expect(cartService.applyPromoCode('user-id', 'INACTIVE'))
        .rejects.toThrow('Промокод неактивний');
    });

    it('should throw error if promo code expired', async () => {
      vi.mocked(prisma.promoCode.findUnique).mockResolvedValue({
        code: 'EXPIRED',
        isActive: true,
        expiresAt: new Date(Date.now() - 1000),
      } as any);

      await expect(cartService.applyPromoCode('user-id', 'EXPIRED'))
        .rejects.toThrow('Термін дії промокоду закінчився');
    });

    it('should throw error if min order amount not met', async () => {
      vi.spyOn(cartService, 'getCart').mockResolvedValue({
        id: 'cart-id',
        items: [],
        subtotal: new Prisma.Decimal(500),
        itemCount: 1,
      } as any);

      vi.mocked(prisma.promoCode.findUnique).mockResolvedValue({
        code: 'MINORDER',
        type: 'PERCENTAGE',
        value: new Prisma.Decimal(10),
        isActive: true,
        minOrderAmount: new Prisma.Decimal(1000),
        usedCount: 0,
        maxUses: null,
        startsAt: null,
        expiresAt: null,
      } as any);

      await expect(cartService.applyPromoCode('user-id', 'MINORDER'))
        .rejects.toThrow('Мінімальна сума замовлення для цього промокоду');
    });
  });
});
