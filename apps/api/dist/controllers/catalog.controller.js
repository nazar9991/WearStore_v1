"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProducts = exports.getFeaturedProducts = exports.getProductBySlug = exports.getProducts = exports.getCategoryBySlug = exports.getCategories = void 0;
const zod_1 = require("zod");
const catalog_service_js_1 = require("../services/catalog.service.js");
const getProductsSchema = zod_1.z.object({
    category: zod_1.z.string().optional(),
    minPrice: zod_1.z.coerce.number().optional(),
    maxPrice: zod_1.z.coerce.number().optional(),
    sizes: zod_1.z.string().optional().transform((s) => s?.split(',')),
    colors: zod_1.z.string().optional().transform((s) => s?.split(',')),
    inStock: zod_1.z.coerce.boolean().optional(),
    onSale: zod_1.z.coerce.boolean().optional(),
    sort: zod_1.z.enum(['price_asc', 'price_desc', 'newest', 'popular']).optional(),
    page: zod_1.z.coerce.number().positive().optional(),
    limit: zod_1.z.coerce.number().positive().max(48).optional(),
});
const getCategories = async (req, res, next) => {
    try {
        const categories = await catalog_service_js_1.catalogService.getCategories();
        res.json({ success: true, data: categories });
    }
    catch (error) {
        next(error);
    }
};
exports.getCategories = getCategories;
const getCategoryBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const category = await catalog_service_js_1.catalogService.getCategoryBySlug(slug);
        res.json({ success: true, data: category });
    }
    catch (error) {
        next(error);
    }
};
exports.getCategoryBySlug = getCategoryBySlug;
const getProducts = async (req, res, next) => {
    try {
        const input = getProductsSchema.parse(req.query);
        const result = await catalog_service_js_1.catalogService.getProducts(input);
        res.json({ success: true, ...result });
    }
    catch (error) {
        next(error);
    }
};
exports.getProducts = getProducts;
const getProductBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const product = await catalog_service_js_1.catalogService.getProductBySlug(slug);
        res.json({ success: true, data: product });
    }
    catch (error) {
        next(error);
    }
};
exports.getProductBySlug = getProductBySlug;
const getFeaturedProducts = async (req, res, next) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 8;
        const products = await catalog_service_js_1.catalogService.getFeaturedProducts(limit);
        res.json({ success: true, data: products });
    }
    catch (error) {
        next(error);
    }
};
exports.getFeaturedProducts = getFeaturedProducts;
const searchProducts = async (req, res, next) => {
    try {
        const query = req.query.q || '';
        const page = req.query.page ? parseInt(req.query.page, 10) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 12;
        const result = await catalog_service_js_1.catalogService.searchProducts(query, page, limit);
        res.json({ success: true, ...result });
    }
    catch (error) {
        next(error);
    }
};
exports.searchProducts = searchProducts;
//# sourceMappingURL=catalog.controller.js.map