"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomersReport = exports.getLowStockProducts = exports.getTopProducts = exports.getSalesReport = exports.getDashboard = void 0;
const zod_1 = require("zod");
const reports_service_js_1 = require("../../services/admin/reports.service.js");
const dateRangeSchema = zod_1.z.object({
    startDate: zod_1.z.coerce.date().optional(),
    endDate: zod_1.z.coerce.date().optional(),
});
const getDashboard = async (req, res, next) => {
    try {
        const dashboard = await reports_service_js_1.adminReportsService.getDashboard();
        res.json({ success: true, data: dashboard });
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboard = getDashboard;
const getSalesReport = async (req, res, next) => {
    try {
        const { startDate, endDate } = dateRangeSchema.parse(req.query);
        const defaultStartDate = new Date();
        defaultStartDate.setDate(defaultStartDate.getDate() - 30);
        const report = await reports_service_js_1.adminReportsService.getSalesReport(startDate || defaultStartDate, endDate || new Date());
        res.json({ success: true, data: report });
    }
    catch (error) {
        next(error);
    }
};
exports.getSalesReport = getSalesReport;
const getTopProducts = async (req, res, next) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const { startDate, endDate } = dateRangeSchema.parse(req.query);
        const products = await reports_service_js_1.adminReportsService.getTopProducts(limit, startDate, endDate);
        res.json({ success: true, data: products });
    }
    catch (error) {
        next(error);
    }
};
exports.getTopProducts = getTopProducts;
const getLowStockProducts = async (req, res, next) => {
    try {
        const threshold = req.query.threshold ? parseInt(req.query.threshold, 10) : 10;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
        const products = await reports_service_js_1.adminReportsService.getLowStockProducts(threshold, limit);
        res.json({ success: true, data: products });
    }
    catch (error) {
        next(error);
    }
};
exports.getLowStockProducts = getLowStockProducts;
const getCustomersReport = async (req, res, next) => {
    try {
        const { startDate, endDate } = dateRangeSchema.parse(req.query);
        const report = await reports_service_js_1.adminReportsService.getCustomersReport(startDate, endDate);
        res.json({ success: true, data: report });
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomersReport = getCustomersReport;
//# sourceMappingURL=reports.controller.js.map