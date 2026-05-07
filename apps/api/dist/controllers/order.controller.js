"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrder = exports.getOrderById = exports.getUserOrders = exports.createOrder = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const order_service_js_1 = require("../services/order.service.js");
const createOrderSchema = zod_1.z.object({
    addressId: zod_1.z.string().optional(),
    deliveryMethod: zod_1.z.nativeEnum(client_1.DeliveryMethod),
    paymentMethod: zod_1.z.nativeEnum(client_1.PaymentMethod),
    promoCode: zod_1.z.string().optional(),
    customerNote: zod_1.z.string().max(500).optional(),
});
const createOrder = async (req, res, next) => {
    try {
        const input = createOrderSchema.parse(req.body);
        const order = await order_service_js_1.orderService.createOrder(req.user.userId, input);
        res.status(201).json({ success: true, data: order });
    }
    catch (error) {
        next(error);
    }
};
exports.createOrder = createOrder;
const getUserOrders = async (req, res, next) => {
    try {
        const page = req.query.page ? parseInt(req.query.page, 10) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const result = await order_service_js_1.orderService.getUserOrders(req.user.userId, page, limit);
        res.json({ success: true, ...result });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserOrders = getUserOrders;
const getOrderById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await order_service_js_1.orderService.getOrderById(req.user.userId, id);
        res.json({ success: true, data: order });
    }
    catch (error) {
        next(error);
    }
};
exports.getOrderById = getOrderById;
const cancelOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await order_service_js_1.orderService.cancelOrder(req.user.userId, id);
        res.json({ success: true, data: order });
    }
    catch (error) {
        next(error);
    }
};
exports.cancelOrder = cancelOrder;
//# sourceMappingURL=order.controller.js.map