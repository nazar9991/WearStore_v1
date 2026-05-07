"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFromWishlist = exports.addToWishlist = exports.getWishlist = void 0;
const wishlist_service_js_1 = require("../services/wishlist.service.js");
const getWishlist = async (req, res, next) => {
    try {
        const wishlist = await wishlist_service_js_1.wishlistService.getWishlist(req.user.userId);
        res.json({ success: true, data: wishlist });
    }
    catch (error) {
        next(error);
    }
};
exports.getWishlist = getWishlist;
const addToWishlist = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const wishlist = await wishlist_service_js_1.wishlistService.addToWishlist(req.user.userId, productId);
        res.json({ success: true, data: wishlist });
    }
    catch (error) {
        next(error);
    }
};
exports.addToWishlist = addToWishlist;
const removeFromWishlist = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const wishlist = await wishlist_service_js_1.wishlistService.removeFromWishlist(req.user.userId, productId);
        res.json({ success: true, data: wishlist });
    }
    catch (error) {
        next(error);
    }
};
exports.removeFromWishlist = removeFromWishlist;
//# sourceMappingURL=wishlist.controller.js.map