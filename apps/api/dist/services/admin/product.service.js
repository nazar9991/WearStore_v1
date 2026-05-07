"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminProductService = exports.AdminProductService = void 0;
const prisma_js_1 = require("../../config/prisma.js");
const slug_js_1 = require("../../utils/slug.js");
const errorHandler_js_1 = require("../../middleware/errorHandler.js");
const catalog_service_js_1 = require("../catalog.service.js");
class AdminProductService {
    async generateSku(categoryId) {
        // Get category prefix
        let prefix = 'PRD';
        if (categoryId) {
            const category = await prisma_js_1.prisma.category.findUnique({
                where: { id: categoryId },
                select: { name: true },
            });
            if (category) {
                // Take first 2-3 letters of category name
                const categoryName = category.name.toUpperCase();
                if (categoryName.startsWith('СУК'))
                    prefix = 'DR'; // Dresses
                else if (categoryName.startsWith('БЛУ'))
                    prefix = 'BL'; // Blouses
                else if (categoryName.startsWith('СПІ') || categoryName.startsWith('ШТА'))
                    prefix = 'PT'; // Pants/Skirts
                else if (categoryName.startsWith('ВЕР'))
                    prefix = 'OW'; // Outerwear
                else
                    prefix = categoryName.slice(0, 2);
            }
        }
        // Get the last SKU with this prefix to determine the next number
        const lastProduct = await prisma_js_1.prisma.product.findFirst({
            where: {
                sku: {
                    startsWith: prefix,
                },
            },
            orderBy: { sku: 'desc' },
            select: { sku: true },
        });
        let nextNumber = 1;
        if (lastProduct?.sku) {
            const match = lastProduct.sku.match(new RegExp(`^${prefix}-(\\d+)$`));
            if (match) {
                nextNumber = parseInt(match[1], 10) + 1;
            }
        }
        // Format: PREFIX-001, PREFIX-002, etc.
        const sku = `${prefix}-${nextNumber.toString().padStart(3, '0')}`;
        // Check if this SKU already exists (edge case)
        const existing = await prisma_js_1.prisma.product.findUnique({ where: { sku } });
        if (existing) {
            return this.generateSku(categoryId); // Recursively try again
        }
        return sku;
    }
    async getProducts(page = 1, limit = 20, search) {
        const offset = (page - 1) * limit;
        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { sku: { contains: search, mode: 'insensitive' } },
                ],
            }
            : {};
        const [products, total] = await Promise.all([
            prisma_js_1.prisma.product.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: offset,
                take: limit,
                include: {
                    category: {
                        select: { id: true, name: true, slug: true },
                    },
                    images: {
                        where: { isPrimary: true },
                        take: 1,
                    },
                    _count: {
                        select: { variants: true },
                    },
                },
            }),
            prisma_js_1.prisma.product.count({ where }),
        ]);
        return {
            data: products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1,
            },
        };
    }
    async getProductById(id) {
        const product = await prisma_js_1.prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                images: {
                    orderBy: { sortOrder: 'asc' },
                },
                variants: {
                    orderBy: [{ size: 'asc' }, { color: 'asc' }],
                },
            },
        });
        if (!product) {
            throw new errorHandler_js_1.AppError('Товар не знайдено', 404);
        }
        return product;
    }
    async createProduct(input) {
        // Auto-generate SKU if not provided
        const sku = input.sku || await this.generateSku(input.categoryId);
        const existingSku = await prisma_js_1.prisma.product.findUnique({
            where: { sku },
        });
        if (existingSku) {
            throw new errorHandler_js_1.AppError('Товар з таким SKU вже існує', 400);
        }
        const category = await prisma_js_1.prisma.category.findUnique({
            where: { id: input.categoryId },
        });
        if (!category) {
            throw new errorHandler_js_1.AppError('Категорію не знайдено', 404);
        }
        const baseSlug = (0, slug_js_1.generateSlug)(input.name);
        const slug = await (0, slug_js_1.ensureUniqueSlug)(baseSlug, async (s) => {
            const existing = await prisma_js_1.prisma.product.findUnique({ where: { slug: s } });
            return !!existing;
        });
        const product = await prisma_js_1.prisma.product.create({
            data: {
                sku,
                name: input.name,
                slug,
                description: input.description,
                shortDescription: input.shortDescription,
                categoryId: input.categoryId,
                basePrice: input.basePrice,
                salePrice: input.salePrice,
                material: input.material,
                careInstructions: input.careInstructions,
                isFeatured: input.isFeatured ?? false,
                isActive: input.isActive ?? true,
            },
            include: {
                category: true,
            },
        });
        await catalog_service_js_1.catalogService.invalidateProductCache();
        return product;
    }
    async updateProduct(id, input) {
        const product = await prisma_js_1.prisma.product.findUnique({ where: { id } });
        if (!product) {
            throw new errorHandler_js_1.AppError('Товар не знайдено', 404);
        }
        if (input.sku && input.sku !== product.sku) {
            const existingSku = await prisma_js_1.prisma.product.findUnique({
                where: { sku: input.sku },
            });
            if (existingSku) {
                throw new errorHandler_js_1.AppError('Товар з таким SKU вже існує', 400);
            }
        }
        if (input.categoryId) {
            const category = await prisma_js_1.prisma.category.findUnique({
                where: { id: input.categoryId },
            });
            if (!category) {
                throw new errorHandler_js_1.AppError('Категорію не знайдено', 404);
            }
        }
        let slug = product.slug;
        if (input.name && input.name !== product.name) {
            const baseSlug = (0, slug_js_1.generateSlug)(input.name);
            slug = await (0, slug_js_1.ensureUniqueSlug)(baseSlug, async (s) => {
                if (s === product.slug)
                    return false;
                const existing = await prisma_js_1.prisma.product.findUnique({ where: { slug: s } });
                return !!existing;
            });
        }
        const updated = await prisma_js_1.prisma.product.update({
            where: { id },
            data: {
                sku: input.sku,
                name: input.name,
                slug,
                description: input.description,
                shortDescription: input.shortDescription,
                categoryId: input.categoryId,
                basePrice: input.basePrice,
                salePrice: input.salePrice,
                material: input.material,
                careInstructions: input.careInstructions,
                isFeatured: input.isFeatured,
                isActive: input.isActive,
            },
            include: {
                category: true,
                images: true,
                variants: true,
            },
        });
        await catalog_service_js_1.catalogService.invalidateProductCache(product.slug);
        if (slug !== product.slug) {
            await catalog_service_js_1.catalogService.invalidateProductCache(slug);
        }
        return updated;
    }
    async deleteProduct(id) {
        const product = await prisma_js_1.prisma.product.findUnique({ where: { id } });
        if (!product) {
            throw new errorHandler_js_1.AppError('Товар не знайдено', 404);
        }
        await prisma_js_1.prisma.product.delete({ where: { id } });
        await catalog_service_js_1.catalogService.invalidateProductCache(product.slug);
    }
    async addImage(productId, url, altText, isPrimary = false) {
        const product = await prisma_js_1.prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            throw new errorHandler_js_1.AppError('Товар не знайдено', 404);
        }
        if (isPrimary) {
            await prisma_js_1.prisma.productImage.updateMany({
                where: { productId, isPrimary: true },
                data: { isPrimary: false },
            });
        }
        const maxOrder = await prisma_js_1.prisma.productImage.findFirst({
            where: { productId },
            orderBy: { sortOrder: 'desc' },
            select: { sortOrder: true },
        });
        const image = await prisma_js_1.prisma.productImage.create({
            data: {
                productId,
                url,
                altText,
                isPrimary,
                sortOrder: (maxOrder?.sortOrder ?? -1) + 1,
            },
        });
        await catalog_service_js_1.catalogService.invalidateProductCache(product.slug);
        return image;
    }
    async deleteImage(productId, imageId) {
        const image = await prisma_js_1.prisma.productImage.findFirst({
            where: { id: imageId, productId },
            include: { product: true },
        });
        if (!image) {
            throw new errorHandler_js_1.AppError('Зображення не знайдено', 404);
        }
        await prisma_js_1.prisma.productImage.delete({ where: { id: imageId } });
        await catalog_service_js_1.catalogService.invalidateProductCache(image.product.slug);
    }
    async addVariant(productId, input) {
        const product = await prisma_js_1.prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            throw new errorHandler_js_1.AppError('Товар не знайдено', 404);
        }
        const existingVariant = await prisma_js_1.prisma.productVariant.findUnique({
            where: {
                productId_size_color: {
                    productId,
                    size: input.size,
                    color: input.color,
                },
            },
        });
        if (existingVariant) {
            throw new errorHandler_js_1.AppError('Варіант з такими параметрами вже існує', 400);
        }
        const variant = await prisma_js_1.prisma.productVariant.create({
            data: {
                productId,
                size: input.size,
                color: input.color,
                stock: input.stock,
                priceAddon: input.priceAddon ?? 0,
            },
        });
        await catalog_service_js_1.catalogService.invalidateProductCache(product.slug);
        return variant;
    }
    async updateVariant(productId, variantId, input) {
        const variant = await prisma_js_1.prisma.productVariant.findFirst({
            where: { id: variantId, productId },
            include: { product: true },
        });
        if (!variant) {
            throw new errorHandler_js_1.AppError('Варіант не знайдено', 404);
        }
        const updated = await prisma_js_1.prisma.productVariant.update({
            where: { id: variantId },
            data: {
                stock: input.stock,
                priceAddon: input.priceAddon,
            },
        });
        await catalog_service_js_1.catalogService.invalidateProductCache(variant.product.slug);
        return updated;
    }
    async deleteVariant(productId, variantId) {
        const variant = await prisma_js_1.prisma.productVariant.findFirst({
            where: { id: variantId, productId },
            include: { product: true },
        });
        if (!variant) {
            throw new errorHandler_js_1.AppError('Варіант не знайдено', 404);
        }
        await prisma_js_1.prisma.productVariant.delete({ where: { id: variantId } });
        await catalog_service_js_1.catalogService.invalidateProductCache(variant.product.slug);
    }
}
exports.AdminProductService = AdminProductService;
exports.adminProductService = new AdminProductService();
//# sourceMappingURL=product.service.js.map