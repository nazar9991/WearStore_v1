import { Prisma, DeliveryMethod, PaymentMethod, OrderStatus } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { generateOrderNumber } from '../utils/orderNumber.js';
import { AppError } from '../middleware/errorHandler.js';
import { cartService } from './cart.service.js';

interface CreateOrderInput {
  addressId?: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  promoCode?: string;
  customerNote?: string;
}

export class OrderService {
  async createOrder(userId: string, input: CreateOrderInput) {
    const cart = await cartService.getCart(userId);

    if (cart.items.length === 0) {
      throw new AppError('Кошик порожній', 400);
    }

    // Validate stock
    for (const item of cart.items) {
      if (item.variant.stock < item.quantity) {
        throw new AppError(
          `Недостатньо товару "${item.product.name}" (${item.variant.size}, ${item.variant.color})`,
          400
        );
      }
    }

    let address = null;
    let addressSnapshot: any = {};

    if (input.addressId) {
      address = await prisma.address.findFirst({
        where: { id: input.addressId, userId },
      });

      if (!address) {
        throw new AppError('Адресу не знайдено', 404);
      }

      addressSnapshot = {
        city: address.city,
        street: address.street,
        building: address.building,
        apartment: address.apartment,
        postalCode: address.postalCode,
      };
    }

    let discount = new Prisma.Decimal(0);
    let promoCodeUsed: string | null = null;

    if (input.promoCode) {
      const promo = await cartService.applyPromoCode(userId, input.promoCode);
      discount = promo.discount;
      promoCodeUsed = promo.code;
    }

    const shippingCost = this.calculateShippingCost(input.deliveryMethod, cart.subtotal);
    const totalAmount = cart.subtotal.sub(discount).add(shippingCost);

    const order = await prisma.$transaction(async (tx) => {
      // Generate order number inside transaction to avoid race conditions
      const orderNumber = await generateOrderNumber(tx);

      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: OrderStatus.PENDING,
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
              toStatus: OrderStatus.PENDING,
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

  async getUserOrders(userId: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          items: true,
        },
      }),
      prisma.order.count({ where: { userId } }),
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

  async getOrderById(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
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
      throw new AppError('Замовлення не знайдено', 404);
    }

    return order;
  }

  async cancelOrder(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true },
    });

    if (!order) {
      throw new AppError('Замовлення не знайдено', 404);
    }

    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      throw new AppError('Замовлення вже неможливо скасувати', 400);
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          statusHistory: {
            create: {
              fromStatus: order.status,
              toStatus: OrderStatus.CANCELLED,
              comment: 'Скасовано клієнтом',
            },
          },
        },
      });

      // Restore stock
      for (const item of order.items) {
        const snapshot = item.productSnapshot as any;
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

  private calculateShippingCost(
    method: DeliveryMethod,
    subtotal: Prisma.Decimal
  ): Prisma.Decimal {
    // Free shipping for orders over 2000 UAH
    if (subtotal.gte(2000)) {
      return new Prisma.Decimal(0);
    }

    switch (method) {
      case 'NOVA_POSHTA_WAREHOUSE':
        return new Prisma.Decimal(70);
      case 'NOVA_POSHTA_COURIER':
        return new Prisma.Decimal(120);
      case 'UKRPOSHTA':
        return new Prisma.Decimal(50);
      default:
        return new Prisma.Decimal(70);
    }
  }
}

export const orderService = new OrderService();
