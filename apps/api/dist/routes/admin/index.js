"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_js_1 = require("../../middleware/auth.js");
const product_routes_js_1 = __importDefault(require("./product.routes.js"));
const category_routes_js_1 = __importDefault(require("./category.routes.js"));
const order_routes_js_1 = __importDefault(require("./order.routes.js"));
const user_routes_js_1 = __importDefault(require("./user.routes.js"));
const promo_routes_js_1 = __importDefault(require("./promo.routes.js"));
const reports_routes_js_1 = __importDefault(require("./reports.routes.js"));
const reportsController = __importStar(require("../../controllers/admin/reports.controller.js"));
const router = (0, express_1.Router)();
// All admin routes require authentication
router.use(auth_js_1.authenticate);
// Manager and Admin routes
router.use('/products', (0, auth_js_1.requireRole)('MANAGER', 'ADMIN'), product_routes_js_1.default);
router.use('/categories', (0, auth_js_1.requireRole)('MANAGER', 'ADMIN'), category_routes_js_1.default);
router.use('/orders', (0, auth_js_1.requireRole)('MANAGER', 'ADMIN'), order_routes_js_1.default);
router.use('/promo-codes', (0, auth_js_1.requireRole)('MANAGER', 'ADMIN'), promo_routes_js_1.default);
// Dashboard available for both Manager and Admin
router.get('/dashboard', (0, auth_js_1.requireRole)('MANAGER', 'ADMIN'), reportsController.getDashboard);
// Admin only routes
router.use('/users', (0, auth_js_1.requireRole)('ADMIN'), user_routes_js_1.default);
router.use('/reports', (0, auth_js_1.requireRole)('ADMIN'), reports_routes_js_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map