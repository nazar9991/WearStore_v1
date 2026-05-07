"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePromoCode = exports.updatePromoCode = exports.createPromoCode = exports.getPromoCodes = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const promo_service_js_1 = require("../../services/admin/promo.service.js");
const createPromoSchema = zod_1.z.object({
    code: zod_1.z.string().min(3).max(20),
    type: zod_1.z.nativeEnum(client_1.PromoCodeType),
    value: zod_1.z.number().positive(),
    minOrderAmount: zod_1.z.number().positive().optional(),
    maxUses: zod_1.z.number().int().positive().optional(),
    startsAt: zod_1.z.coerce.date().optional(),
    expiresAt: zod_1.z.coerce.date().optional(),
    isActive: zod_1.z.boolean().optional(),
});
const getPromoCodes = async (req, res, next) => {
    try {
        const page = req.query.page ? parseInt(req.query.page, 10) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
        const result = await promo_service_js_1.adminPromoService.getPromoCodes(page, limit);
        res.json({ success: true, ...result });
    }
    catch (error) {
        next(error);
    }
};
exports.getPromoCodes = getPromoCodes;
const createPromoCode = async (req, res, next) => {
    try {
        const input = createPromoSchema.parse(req.body);
        const promoCode = await promo_service_js_1.adminPromoService.createPromoCode(input);
        res.status(201).json({ success: true, data: promoCode });
    }
    catch (error) {
        next(error);
    }
};
exports.createPromoCode = createPromoCode;
const updatePromoCode = async (req, res, next) => {
    try {
        const { id } = req.params;
        const input = createPromoSchema.partial().parse(req.body);
        const promoCode = await promo_service_js_1.adminPromoService.updatePromoCode(id, input);
        res.json({ success: true, data: promoCode });
    }
    catch (error) {
        next(error);
    }
};
exports.updatePromoCode = updatePromoCode;
const deletePromoCode = async (req, res, next) => {
    try {
        const { id } = req.params;
        await promo_service_js_1.adminPromoService.deletePromoCode(id);
        res.json({ success: true, message: 'Промокод видалено' });
    }
    catch (error) {
        next(error);
    }
};
exports.deletePromoCode = deletePromoCode;
//# sourceMappingURL=promo.controller.js.map