"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminCategoryService = exports.AdminCategoryService = void 0;
const prisma_js_1 = require("../../config/prisma.js");
const slug_js_1 = require("../../utils/slug.js");
const errorHandler_js_1 = require("../../middleware/errorHandler.js");
const catalog_service_js_1 = require("../catalog.service.js");
class AdminCategoryService {
    async getCategories() {
        return prisma_js_1.prisma.category.findMany({
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
            include: {
                parent: {
                    select: { id: true, name: true, slug: true },
                },
                _count: {
                    select: { products: true, children: true },
                },
            },
        });
    }
    async createCategory(input) {
        if (input.parentId) {
            const parent = await prisma_js_1.prisma.category.findUnique({
                where: { id: input.parentId },
            });
            if (!parent) {
                throw new errorHandler_js_1.AppError('Батьківську категорію не знайдено', 404);
            }
        }
        const baseSlug = (0, slug_js_1.generateSlug)(input.name);
        const slug = await (0, slug_js_1.ensureUniqueSlug)(baseSlug, async (s) => {
            const existing = await prisma_js_1.prisma.category.findUnique({ where: { slug: s } });
            return !!existing;
        });
        const category = await prisma_js_1.prisma.category.create({
            data: {
                name: input.name,
                slug,
                description: input.description,
                imageUrl: input.imageUrl,
                parentId: input.parentId,
                sortOrder: input.sortOrder ?? 0,
                isActive: input.isActive ?? true,
            },
        });
        await catalog_service_js_1.catalogService.invalidateCategoryCache();
        return category;
    }
    async updateCategory(id, input) {
        const category = await prisma_js_1.prisma.category.findUnique({ where: { id } });
        if (!category) {
            throw new errorHandler_js_1.AppError('Категорію не знайдено', 404);
        }
        if (input.parentId) {
            if (input.parentId === id) {
                throw new errorHandler_js_1.AppError('Категорія не може бути батьківською для себе', 400);
            }
            const parent = await prisma_js_1.prisma.category.findUnique({
                where: { id: input.parentId },
            });
            if (!parent) {
                throw new errorHandler_js_1.AppError('Батьківську категорію не знайдено', 404);
            }
            // Check for circular reference
            let current = parent;
            while (current.parentId) {
                if (current.parentId === id) {
                    throw new errorHandler_js_1.AppError('Циклічне посилання категорій недопустиме', 400);
                }
                const nextParent = await prisma_js_1.prisma.category.findUnique({
                    where: { id: current.parentId },
                });
                if (!nextParent)
                    break;
                current = nextParent;
            }
        }
        let slug = category.slug;
        if (input.name && input.name !== category.name) {
            const baseSlug = (0, slug_js_1.generateSlug)(input.name);
            slug = await (0, slug_js_1.ensureUniqueSlug)(baseSlug, async (s) => {
                if (s === category.slug)
                    return false;
                const existing = await prisma_js_1.prisma.category.findUnique({ where: { slug: s } });
                return !!existing;
            });
        }
        const updated = await prisma_js_1.prisma.category.update({
            where: { id },
            data: {
                name: input.name,
                slug,
                description: input.description,
                imageUrl: input.imageUrl,
                parentId: input.parentId,
                sortOrder: input.sortOrder,
                isActive: input.isActive,
            },
        });
        await catalog_service_js_1.catalogService.invalidateCategoryCache();
        return updated;
    }
    async deleteCategory(id) {
        const category = await prisma_js_1.prisma.category.findUnique({
            where: { id },
            include: {
                _count: { select: { products: true, children: true } },
            },
        });
        if (!category) {
            throw new errorHandler_js_1.AppError('Категорію не знайдено', 404);
        }
        if (category._count.products > 0) {
            throw new errorHandler_js_1.AppError('Неможливо видалити категорію з товарами. Спочатку перемістіть товари.', 400);
        }
        if (category._count.children > 0) {
            throw new errorHandler_js_1.AppError('Неможливо видалити категорію з підкатегоріями. Спочатку видаліть підкатегорії.', 400);
        }
        await prisma_js_1.prisma.category.delete({ where: { id } });
        await catalog_service_js_1.catalogService.invalidateCategoryCache();
    }
    async reorderCategories(orders) {
        await prisma_js_1.prisma.$transaction(orders.map((order) => prisma_js_1.prisma.category.update({
            where: { id: order.id },
            data: { sortOrder: order.sortOrder },
        })));
        await catalog_service_js_1.catalogService.invalidateCategoryCache();
    }
}
exports.AdminCategoryService = AdminCategoryService;
exports.adminCategoryService = new AdminCategoryService();
//# sourceMappingURL=category.service.js.map