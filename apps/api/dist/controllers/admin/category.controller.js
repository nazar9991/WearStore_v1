"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderCategories = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategories = void 0;
const zod_1 = require("zod");
const category_service_js_1 = require("../../services/admin/category.service.js");
const createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    imageUrl: zod_1.z.string().optional(),
    parentId: zod_1.z.string().nullable().optional(),
    sortOrder: zod_1.z.number().int().optional(),
    isActive: zod_1.z.boolean().optional(),
});
const reorderSchema = zod_1.z.array(zod_1.z.object({
    id: zod_1.z.string(),
    sortOrder: zod_1.z.number().int(),
}));
const getCategories = async (req, res, next) => {
    try {
        const categories = await category_service_js_1.adminCategoryService.getCategories();
        res.json({ success: true, data: categories });
    }
    catch (error) {
        next(error);
    }
};
exports.getCategories = getCategories;
const createCategory = async (req, res, next) => {
    try {
        const input = createCategorySchema.parse(req.body);
        const category = await category_service_js_1.adminCategoryService.createCategory(input);
        res.status(201).json({ success: true, data: category });
    }
    catch (error) {
        next(error);
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const input = createCategorySchema.partial().parse(req.body);
        const category = await category_service_js_1.adminCategoryService.updateCategory(id, input);
        res.json({ success: true, data: category });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        await category_service_js_1.adminCategoryService.deleteCategory(id);
        res.json({ success: true, message: 'Категорію видалено' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCategory = deleteCategory;
const reorderCategories = async (req, res, next) => {
    try {
        const orders = reorderSchema.parse(req.body);
        await category_service_js_1.adminCategoryService.reorderCategories(orders);
        res.json({ success: true, message: 'Порядок категорій оновлено' });
    }
    catch (error) {
        next(error);
    }
};
exports.reorderCategories = reorderCategories;
//# sourceMappingURL=category.controller.js.map