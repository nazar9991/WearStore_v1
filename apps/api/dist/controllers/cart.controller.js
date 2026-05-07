"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyPromoCode = exports.clearCart = exports.removeItem = exports.updateItemQuantity = exports.addItem = exports.getCart = void 0;
const zod_1 = require("zod");
const cart_service_js_1 = require("../services/cart.service.js");
const addItemSchema = zod_1.z.object({
    variantId: zod_1.z.string(),
    quantity: zod_1.z.number().int().positive().default(1),
});
const updateQuantitySchema = zod_1.z.object({
    quantity: zod_1.z.number().int().min(0),
});
const getCart = async (req, res, next) => {
    try {
        const cart = await cart_service_js_1.cartService.getCart(req.user.userId);
        res.json({ success: true, data: cart });
    }
    catch (error) {
        next(error);
    }
};
exports.getCart = getCart;
const addItem = async (req, res, next) => {
    try {
        const { variantId, quantity } = addItemSchema.parse(req.body);
        const cart = await cart_service_js_1.cartService.addItem(req.user.userId, variantId, quantity);
        res.json({ success: true, data: cart });
    }
    catch (error) {
        next(error);
    }
};
exports.addItem = addItem;
const updateItemQuantity = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { quantity } = updateQuantitySchema.parse(req.body);
        const cart = await cart_service_js_1.cartService.updateItemQuantity(req.user.userId, id, quantity);
        res.json({ success: true, data: cart });
    }
    catch (error) {
        next(error);
    }
};
exports.updateItemQuantity = updateItemQuantity;
const removeItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const cart = await cart_service_js_1.cartService.removeItem(req.user.userId, id);
        res.json({ success: true, data: cart });
    }
    catch (error) {
        next(error);
    }
};
exports.removeItem = removeItem;
const clearCart = async (req, res, next) => {
    try {
        const cart = await cart_service_js_1.cartService.clearCart(req.user.userId);
        res.json({ success: true, data: cart });
    }
    catch (error) {
        next(error);
    }
};
exports.clearCart = clearCart;
const applyPromoCode = async (req, res, next) => {
    try {
        const { code } = zod_1.z.object({ code: zod_1.z.string() }).parse(req.body);
        const result = await cart_service_js_1.cartService.applyPromoCode(req.user.userId, code);
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.applyPromoCode = applyPromoCode;
//# sourceMappingURL=cart.controller.js.map