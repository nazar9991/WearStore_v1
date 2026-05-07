import { Prisma, Size } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { cacheGet, cacheSet, cacheDel, cacheDelPattern } from '../config/redis.js';
import { config } from '../config/index.js';
import { AppError } from '../middleware/errorHandler.js';

interface GetProductsInput {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: Size[];
  colors?: string[];
  inStock?: boolean;
  onSale?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  page?: number;
  limit?: number;
}

interface ProductWithDetails {
  id: string;
  sku: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  basePrice: Prisma.Decimal;
  salePrice: Prisma.Decimal | null;
  isFeatured: boolean;
  category: { id: string; name: string; slug: string };
  images: { url: string; altText: string | null; isPrimary: boolean }[];
  variants: { size: Size; color: string; stock: number }[];
}

export class CatalogService {
  async getCategories() {
    const cacheKey = 'categories:tree';
    const cached = await cacheGet<any>(cacheKey);
    if (cached) return cached;

    const categories = await prisma.category.findMany({
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
    await cacheSet(cacheKey, tree, config.cache.categories);
    return tree;
  }

  async getCategoryBySlug(slug: string) {
    const category = await prisma.category.findUnique({
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
      throw new AppError('Категорію не знайдено', 404);
    }

    return category;
  }

  async getProducts(input: GetProductsInput) {
    const page = input.page || 1;
    const limit = Math.min(input.limit || 12, 48);
    const offset = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    if (input.category) {
      const category = await prisma.category.findUnique({
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

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (input.sort === 'price_asc') orderBy = { basePrice: 'asc' };
    if (input.sort === 'price_desc') orderBy = { basePrice: 'desc' };
    if (input.sort === 'newest') orderBy = { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
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
      prisma.product.count({ where }),
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

  async getProductBySlug(slug: string) {
    const cacheKey = `product:${slug}`;
    const cached = await cacheGet<any>(cacheKey);
    if (cached) return cached;

    const product = await prisma.product.findUnique({
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
      throw new AppError('Товар не знайдено', 404);
    }

    await cacheSet(cacheKey, product, config.cache.productDetail);
    return product;
  }

  async getFeaturedProducts(limit = 8) {
    const cacheKey = `products:featured:${limit}`;
    const cached = await cacheGet<any>(cacheKey);
    if (cached) return cached;

    const products = await prisma.product.findMany({
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

    await cacheSet(cacheKey, products, config.cache.productList);
    return products;
  }

  async searchProducts(query: string, page = 1, limit = 12) {
    const offset = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
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
      prisma.product.count({
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

  async invalidateProductCache(productSlug?: string) {
    if (productSlug) {
      await cacheDel(`product:${productSlug}`);
    }
    await cacheDelPattern('products:*');
  }

  async invalidateCategoryCache() {
    await cacheDel('categories:tree');
  }
}

export const catalogService = new CatalogService();
