"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catalogService = exports.CatalogService = void 0;
const prisma_js_1 = require("../config/prisma.js");
const redis_js_1 = require("../config/redis.js");
const index_js_1 = require("../config/index.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
class CatalogService {
    async getCategories() {
        const cacheKey = 'categories:tree';
        const cached = await (0, redis_js_1.cacheGet)(cacheKey);
        if (cached)
            return cached;
        const categories = await prisma_js_1.prisma.category.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            include: {
                children: {
                    where: { isActive: true },
                    orderBy: { sortOrder: 'asc' },
                },
            },
        });
        const tree = categories.filter((c) => !c.parentId);
        await (0, redis_js_1.cacheSet)(cacheKey, tree, index_js_1.config.cache.categories);
        return tree;
    }
    async getCategoryBySlug(slug) {
        const category = await prisma_js_1.prisma.category.findUnique({
            where: { slug, isActive: true },
            include: {
                children: {
                    where: { isActive: true },
                    orderBy: { sortOrder: 'asc' },
                },
                parent: {
                    select: { id: true, name: true, slug: true },
                },
            },
        });
        if (!category) {
            throw new errorHandler_js_1.AppError('Категорію не знайдено', 404);
        }
        return category;
    }
    async getProducts(input) {
        const page = input.page || 1;
        const limit = Math.min(input.limit || 12, 48);
        const offset = (page - 1) * limit;
        const where = {
            isActive: true,
        };
        if (input.category) {
            const category = await prisma_js_1.prisma.category.findUnique({
                where: { slug: input.category },
                include: {
                    children: {
                        select: { id: true },
                    },
                },
            });
            if (category) {
                const categoryIds = [category.id, ...category.children.map((c) => c.id)];
                where.categoryId = { in: categoryIds };
            }
        }
        if (input.minPrice !== undefined || input.maxPrice !== undefined) {
            where.OR = [
                {
                    salePrice: {
                        gte: input.minPrice,
                        lte: input.maxPrice,
                    },
                },
                {
                    AND: [
                        { salePrice: null },
                        {
                            basePrice: {
                                gte: input.minPrice,
                                lte: input.maxPrice,
                            },
                        },
                    ],
                },
            ];
        }
        if (input.onSale) {
            where.salePrice = { not: null };
        }
        if (input.sizes?.length || input.colors?.length || input.inStock) {
            where.variants = {
                some: {
                    ...(input.sizes?.length && { size: { in: input.sizes } }),
                    ...(input.colors?.length && { color: { in: input.colors } }),
                    ...(input.inStock && { stock: { gt: 0 } }),
                },
            };
        }
        let orderBy = { createdAt: 'desc' };
        if (input.sort === 'price_asc')
            orderBy = { basePrice: 'asc' };
        if (input.sort === 'price_desc')
            orderBy = { basePrice: 'desc' };
        if (input.sort === 'newest')
            orderBy = { createdAt: 'desc' };
        const [products, total] = await Promise.all([
            prisma_js_1.prisma.product.findMany({
                where,
                orderBy,
                skip: offset,
                take: limit,
                include: {
                    category: {
                        select: { id: true, name: true, slug: true },
                    },
                    images: {
                        orderBy: { sortOrder: 'asc' },
                        take: 2,
                    },
                    variants: {
                        select: { size: true, color: true, stock: true },
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
    async getProductBySlug(slug) {
        const cacheKey = `product:${slug}`;
        const cached = await (0, redis_js_1.cacheGet)(cacheKey);
        if (cached)
            return cached;
        const product = await prisma_js_1.prisma.product.findUnique({
            where: { slug, isActive: true },
            include: {
                category: {
                    select: { id: true, name: true, slug: true },
                },
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
        await (0, redis_js_1.cacheSet)(cacheKey, product, index_js_1.config.cache.productDetail);
        return product;
    }
    async getFeaturedProducts(limit = 8) {
        const cacheKey = `products:featured:${limit}`;
        const cached = await (0, redis_js_1.cacheGet)(cacheKey);
        if (cached)
            return cached;
        const products = await prisma_js_1.prisma.product.findMany({
            where: {
                isActive: true,
                isFeatured: true,
            },
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                category: {
                    select: { id: true, name: true, slug: true },
                },
                images: {
                    orderBy: { sortOrder: 'asc' },
                    take: 2,
                },
                variants: {
                    select: { size: true, color: true, stock: true },
                },
            },
        });
        await (0, redis_js_1.cacheSet)(cacheKey, products, index_js_1.config.cache.productList);
        return products;
    }
    async searchProducts(query, page = 1, limit = 12) {
        const offset = (page - 1) * limit;
        const [products, total] = await Promise.all([
            prisma_js_1.prisma.product.findMany({
                where: {
                    isActive: true,
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } },
                        { sku: { contains: query, mode: 'insensitive' } },
                    ],
                },
                skip: offset,
                take: limit,
                orderBy: { name: 'asc' },
                include: {
                    category: {
                        select: { id: true, name: true, slug: true },
                    },
                    images: {
                        where: { isPrimary: true },
                        take: 1,
                    },
                    variants: {
                        select: { size: true, color: true, stock: true },
                    },
                },
            }),
            prisma_js_1.prisma.product.count({
                where: {
                    isActive: true,
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } },
                        { sku: { contains: query, mode: 'insensitive' } },
                    ],
                },
            }),
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
    async invalidateProductCache(productSlug) {
        if (productSlug) {
            await (0, redis_js_1.cacheDel)(`product:${productSlug}`);
        }
        await (0, redis_js_1.cacheDelPattern)('products:*');
    }
    async invalidateCategoryCache() {
        await (0, redis_js_1.cacheDel)('categories:tree');
    }
}
exports.CatalogService = CatalogService;
exports.catalogService = new CatalogService();
//# sourceMappingURL=catalog.service.js.map