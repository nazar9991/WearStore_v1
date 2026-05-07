"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addManagerNote = exports.addTrackingNumber = exports.updateStatus = exports.getOrderById = exports.getOrders = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const order_service_js_1 = require("../../services/admin/order.service.js");
const getOrdersSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.OrderStatus).optional(),
    paymentStatus: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
    startDate: zod_1.z.coerce.date().optional(),
    endDate: zod_1.z.coerce.date().optional(),
    page: zod_1.z.coerce.number().positive().optional(),
    limit: zod_1.z.coerce.number().positive().optional(),
});
const getOrders = async (req, res, next) => {
    try {
        const input = getOrdersSchema.parse(req.query);
        const result = await order_service_js_1.adminOrderService.getOrders(input);
        res.json({ success: true, ...result });
    }
    catch (error) {
        next(error);
    }
};
exports.getOrders = getOrders;
const getOrderById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await order_service_js_1.adminOrderService.getOrderById(id);
        res.json({ success: true, data: order });
    }
    catch (error) {
        next(error);
    }
};
exports.getOrderById = getOrderById;
const updateStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, comment } = zod_1.z
            .object({
            status: zod_1.z.nativeEnum(client_1.OrderStatus),
            comment: zod_1.z.string().optional(),
        })
            .parse(req.body);
        const order = await order_service_js_1.adminOrderService.updateStatus(id, status, req.user.userId, comment);
        res.json({ success: true, data: order });
    }
    catch (error) {
        next(error);
    }
};
exports.updateStatus = updateStatus;
const addTrackingNumber = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { trackingNumber } = zod_1.z
            .object({ trackingNumber: zod_1.z.string().min(1) })
            .parse(req.body);
        const order = await order_service_js_1.adminOrderService.addTrackingNumber(id, trackingNumber);
        res.json({ success: true, data: order });
    }
    catch (error) {
        next(error);
    }
};
exports.addTrackingNumber = addTrackingNumber;
const addManagerNote = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { note } = zod_1.z.object({ note: zod_1.z.string() }).parse(req.body);
        const order = await order_service_js_1.adminOrderService.addManagerNote(id, note);
        res.json({ success: true, data: order });
    }
    catch (error) {
        next(error);
    }
};
exports.addManagerNote = addManagerNote;
//# sourceMappingURL=order.controller.js.map