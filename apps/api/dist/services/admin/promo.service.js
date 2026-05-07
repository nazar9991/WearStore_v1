"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminPromoService = exports.AdminPromoService = void 0;
const prisma_js_1 = require("../../config/prisma.js");
const errorHandler_js_1 = require("../../middleware/errorHandler.js");
class AdminPromoService {
    async getPromoCodes(page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const [promoCodes, total] = await Promise.all([
            prisma_js_1.prisma.promoCode.findMany({
                orderBy: { createdAt: 'desc' },
                skip: offset,
                take: limit,
            }),
            prisma_js_1.prisma.promoCode.count(),
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
    async createPromoCode(input) {
        const code = input.code.toUpperCase();
        const existing = await prisma_js_1.prisma.promoCode.findUnique({
            where: { code },
        });
        if (existing) {
            throw new errorHandler_js_1.AppError('Промокод з таким кодом вже існує', 400);
        }
        if (input.type === 'PERCENTAGE' && (input.value < 0 || input.value > 100)) {
            throw new errorHandler_js_1.AppError('Відсоток знижки повинен бути від 0 до 100', 400);
        }
        return prisma_js_1.prisma.promoCode.create({
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
    async updatePromoCode(id, input) {
        const promoCode = await prisma_js_1.prisma.promoCode.findUnique({ where: { id } });
        if (!promoCode) {
            throw new errorHandler_js_1.AppError('Промокод не знайдено', 404);
        }
        if (input.code) {
            const code = input.code.toUpperCase();
            if (code !== promoCode.code) {
                const existing = await prisma_js_1.prisma.promoCode.findUnique({ where: { code } });
                if (existing) {
                    throw new errorHandler_js_1.AppError('Промокод з таким кодом вже існує', 400);
                }
            }
            input.code = code;
        }
        if (input.type === 'PERCENTAGE' && input.value && (input.value < 0 || input.value > 100)) {
            throw new errorHandler_js_1.AppError('Відсоток знижки повинен бути від 0 до 100', 400);
        }
        return prisma_js_1.prisma.promoCode.update({
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
    async deletePromoCode(id) {
        const promoCode = await prisma_js_1.prisma.promoCode.findUnique({ where: { id } });
        if (!promoCode) {
            throw new errorHandler_js_1.AppError('Промокод не знайдено', 404);
        }
        await prisma_js_1.prisma.promoCode.delete({ where: { id } });
    }
}
exports.AdminPromoService = AdminPromoService;
exports.adminPromoService = new AdminPromoService();
//# sourceMappingURL=promo.service.js.map