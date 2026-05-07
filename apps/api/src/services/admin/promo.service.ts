import { PromoCodeType } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

interface CreatePromoInput {
  code: string;
  type: PromoCodeType;
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
  startsAt?: Date;
  expiresAt?: Date;
  isActive?: boolean;
}

interface UpdatePromoInput extends Partial<CreatePromoInput> {}

export class AdminPromoService {
  async getPromoCodes(page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [promoCodes, total] = await Promise.all([
      prisma.promoCode.findMany({
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.promoCode.count(),
    ]);

    return {
      data: promoCodes,
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

  async createPromoCode(input: CreatePromoInput) {
    const code = input.code.toUpperCase();

    const existing = await prisma.promoCode.findUnique({
      where: { code },
    });

    if (existing) {
      throw new AppError('Промокод з таким кодом вже існує', 400);
    }

    if (input.type === 'PERCENTAGE' && (input.value < 0 || input.value > 100)) {
      throw new AppError('Відсоток знижки повинен бути від 0 до 100', 400);
    }

    return prisma.promoCode.create({
      data: {
        code,
        type: input.type,
        value: input.value,
        minOrderAmount: input.minOrderAmount,
        maxUses: input.maxUses,
        startsAt: input.startsAt,
        expiresAt: input.expiresAt,
        isActive: input.isActive ?? true,
      },
    });
  }

  async updatePromoCode(id: string, input: UpdatePromoInput) {
    const promoCode = await prisma.promoCode.findUnique({ where: { id } });

    if (!promoCode) {
      throw new AppError('Промокод не знайдено', 404);
    }

    if (input.code) {
      const code = input.code.toUpperCase();
      if (code !== promoCode.code) {
        const existing = await prisma.promoCode.findUnique({ where: { code } });
        if (existing) {
          throw new AppError('Промокод з таким кодом вже існує', 400);
        }
      }
      input.code = code;
    }

    if (input.type === 'PERCENTAGE' && input.value && (input.value < 0 || input.value > 100)) {
      throw new AppError('Відсоток знижки повинен бути від 0 до 100', 400);
    }

    return prisma.promoCode.update({
      where: { id },
      data: {
        code: input.code,
        type: input.type,
        value: input.value,
        minOrderAmount: input.minOrderAmount,
        maxUses: input.maxUses,
        startsAt: input.startsAt,
        expiresAt: input.expiresAt,
        isActive: input.isActive,
      },
    });
  }

  async deletePromoCode(id: string) {
    const promoCode = await prisma.promoCode.findUnique({ where: { id } });

    if (!promoCode) {
      throw new AppError('Промокод не знайдено', 404);
    }

    await prisma.promoCode.delete({ where: { id } });
  }
}

export const adminPromoService = new AdminPromoService();
