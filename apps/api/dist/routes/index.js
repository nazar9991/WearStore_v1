"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_js_1 = __importDefault(require("./auth.routes.js"));
const catalog_routes_js_1 = __importDefault(require("./catalog.routes.js"));
const cart_routes_js_1 = __importDefault(require("./cart.routes.js"));
const order_routes_js_1 = __importDefault(require("./order.routes.js"));
const wishlist_routes_js_1 = __importDefault(require("./wishlist.routes.js"));
const profile_routes_js_1 = __importDefault(require("./profile.routes.js"));
const index_js_1 = __importDefault(require("./admin/index.js"));
const router = (0, express_1.Router)();
router.use('/auth', auth_routes_js_1.default);
router.use('/catalog', catalog_routes_js_1.default);
router.use('/cart', cart_routes_js_1.default);
router.use('/orders', order_routes_js_1.default);
router.use('/wishlist', wishlist_routes_js_1.default);
router.use('/profile', profile_routes_js_1.default);
router.use('/admin', index_js_1.default);
// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
exports.default = router;
//# sourceMappingURL=index.js.map