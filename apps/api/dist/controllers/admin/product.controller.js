"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVariant = exports.updateVariant = exports.addVariant = exports.deleteImage = exports.uploadImage = exports.addImage = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = exports.generateSku = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const product_service_js_1 = require("../../services/admin/product.service.js");
const upload_js_1 = require("../../utils/upload.js");
const createProductSchema = zod_1.z.object({
    sku: zod_1.z.string().min(1).optional(),
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
    shortDescription: zod_1.z.string().optional(),
    categoryId: zod_1.z.string(),
    basePrice: zod_1.z.number().positive(),
    salePrice: zod_1.z.number().positive().optional().nullable(),
    material: zod_1.z.string().optional(),
    careInstructions: zod_1.z.string().optional(),
    isFeatured: zod_1.z.boolean().optional(),
    isActive: zod_1.z.boolean().optional(),
});
const createVariantSchema = zod_1.z.object({
    size: zod_1.z.nativeEnum(client_1.Size),
    color: zod_1.z.string().min(1),
    stock: zod_1.z.number().int().min(0),
    priceAddon: zod_1.z.number().optional(),
});
const generateSku = async (req, res, next) => {
    try {
        const categoryId = req.query.categoryId;
        const sku = await product_service_js_1.adminProductService.generateSku(categoryId);
        res.json({ success: true, data: { sku } });
    }
    catch (error) {
        next(error);
    }
};
exports.generateSku = generateSku;
const getProducts = async (req, res, next) => {
    try {
        const page = req.query.page ? parseInt(req.query.page, 10) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
        const search = req.query.search;
        const result = await product_service_js_1.adminProductService.getProducts(page, limit, search);
        res.json({ success: true, ...result });
    }
    catch (error) {
        next(error);
    }
};
exports.getProducts = getProducts;
const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await product_service_js_1.adminProductService.getProductById(id);
        res.json({ success: true, data: product });
    }
    catch (error) {
        next(error);
    }
};
exports.getProductById = getProductById;
const createProduct = async (req, res, next) => {
    try {
        const input = createProductSchema.parse(req.body);
        const product = await product_service_js_1.adminProductService.createProduct(input);
        res.status(201).json({ success: true, data: product });
    }
    catch (error) {
        next(error);
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const input = createProductSchema.partial().parse(req.body);
        const product = await product_service_js_1.adminProductService.updateProduct(id, input);
        res.json({ success: true, data: product });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        await product_service_js_1.adminProductService.deleteProduct(id);
        res.json({ success: true, message: 'Товар видалено' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProduct = deleteProduct;
const addImage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { url, altText, isPrimary } = zod_1.z
            .object({
            url: zod_1.z.string().url(),
            altText: zod_1.z.string().optional(),
            isPrimary: zod_1.z.boolean().optional(),
        })
            .parse(req.body);
        const image = await product_service_js_1.adminProductService.addImage(id, url, altText, isPrimary);
        res.status(201).json({ success: true, data: image });
    }
    catch (error) {
        next(error);
    }
};
exports.addImage = addImage;
const uploadImage = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Файл не завантажено' });
        }
        const altText = req.body.altText || '';
        const isPrimary = req.body.isPrimary === 'true';
        // Process and save the uploaded image
        const processed = await (0, upload_js_1.processAndSaveImage)(req.file);
        // Add image to product in database
        const image = await product_service_js_1.adminProductService.addImage(id, processed.url, altText, isPrimary);
        res.status(201).json({ success: true, data: image });
    }
    catch (error) {
        next(error);
    }
};
exports.uploadImage = uploadImage;
const deleteImage = async (req, res, next) => {
    try {
        const { id, imageId } = req.params;
        // Get image URL before deletion to remove file
        const product = await product_service_js_1.adminProductService.getProductById(id);
        const image = product.images.find((img) => img.id === imageId);
        await product_service_js_1.adminProductService.deleteImage(id, imageId);
        // Delete file if it's a local upload
        if (image?.url) {
            await (0, upload_js_1.deleteImageFile)(image.url);
        }
        res.json({ success: true, message: 'Зображення видалено' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteImage = deleteImage;
const addVariant = async (req, res, next) => {
    try {
        const { id } = req.params;
        const input = createVariantSchema.parse(req.body);
        const variant = await product_service_js_1.adminProductService.addVariant(id, input);
        res.status(201).json({ success: true, data: variant });
    }
    catch (error) {
        next(error);
    }
};
exports.addVariant = addVariant;
const updateVariant = async (req, res, next) => {
    try {
        const { id, variantId } = req.params;
        const input = createVariantSchema.partial().parse(req.body);
        const variant = await product_service_js_1.adminProductService.updateVariant(id, variantId, input);
        res.json({ success: true, data: variant });
    }
    catch (error) {
        next(error);
    }
};
exports.updateVariant = updateVariant;
const deleteVariant = async (req, res, next) => {
    try {
        const { id, variantId } = req.params;
        await product_service_js_1.adminProductService.deleteVariant(id, variantId);
        res.json({ success: true, message: 'Варіант видалено' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteVariant = deleteVariant;
//# sourceMappingURL=product.controller.js.map