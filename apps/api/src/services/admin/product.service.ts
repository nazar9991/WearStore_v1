import { Prisma, Size } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { generateSlug, ensureUniqueSlug } from '../../utils/slug.js';
import { AppError } from '../../middleware/errorHandler.js';
import { catalogService } from '../catalog.service.js';

interface CreateProductInput {
  sku?: string;
  name: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  basePrice: number;
  salePrice?: number;
  material?: string;
  careInstructions?: string;
  isFeatured?: boolean;
  isActive?: boolean;
}

interface UpdateProductInput extends Partial<CreateProductInput> {}

interface CreateVariantInput {
  size: Size;
  color: string;
  stock: number;
  priceAddon?: number;
}

export class AdminProductService {
  async generateSku(categoryId?: string): Promise<string> {
    // Get category prefix
    let prefix = 'PRD';
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { name: true },
      });
      if (category) {
        // Take first 2-3 letters of category name
        const categoryName = category.name.toUpperCase();
        if (categoryName.startsWith('СУК')) prefix = 'DR'; // Dresses
        else if (categoryName.startsWith('БЛУ')) prefix = 'BL'; // Blouses
        else if (categoryName.startsWith('СПІ') || categoryName.startsWith('ШТА')) prefix = 'PT'; // Pants/Skirts
        else if (categoryName.startsWith('ВЕР')) prefix = 'OW'; // Outerwear
        else prefix = categoryName.slice(0, 2);
      }
    }

    // Get the last SKU with this prefix to determine the next number
    const lastProduct = await prisma.product.findFirst({
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
    const existing = await prisma.product.findUnique({ where: { sku } });
    if (existing) {
      return this.generateSku(categoryId); // Recursively try again
    }

    return sku;
  }

  async getProducts(page = 1, limit = 20, search?: string) {
    const offset = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
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

  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
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
      throw new AppError('Товар не знайдено', 404);
    }

    return product;
  }

  async createProduct(input: CreateProductInput) {
    // Auto-generate SKU if not provided
    const sku = input.sku || await this.generateSku(input.categoryId);

    const existingSku = await prisma.product.findUnique({
      where: { sku },
    });

    if (existingSku) {
      throw new AppError('Товар з таким SKU вже існує', 400);
    }

    const category = await prisma.category.findUnique({
      where: { id: input.categoryId },
    });

    if (!category) {
      throw new AppError('Категорію не знайдено', 404);
    }

    const baseSlug = generateSlug(input.name);
    const slug = await ensureUniqueSlug(baseSlug, async (s) => {
      const existing = await prisma.product.findUnique({ where: { slug: s } });
      return !!existing;
    });

    const product = await prisma.product.create({
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

    await catalogService.invalidateProductCache();

    return product;
  }

  async updateProduct(id: string, input: UpdateProductInput) {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new AppError('Товар не знайдено', 404);
    }

    if (input.sku && input.sku !== product.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku: input.sku },
      });
      if (existingSku) {
        throw new AppError('Товар з таким SKU вже існує', 400);
      }
    }

    if (input.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: input.categoryId },
      });
      if (!category) {
        throw new AppError('Категорію не знайдено', 404);
      }
    }

    let slug = product.slug;
    if (input.name && input.name !== product.name) {
      const baseSlug = generateSlug(input.name);
      slug = await ensureUniqueSlug(baseSlug, async (s) => {
        if (s === product.slug) return false;
        const existing = await prisma.product.findUnique({ where: { slug: s } });
        return !!existing;
      });
    }

    const updated = await prisma.product.update({
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

    await catalogService.invalidateProductCache(product.slug);
    if (slug !== product.slug) {
      await catalogService.invalidateProductCache(slug);
    }

    return updated;
  }

  async deleteProduct(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new AppError('Товар не знайдено', 404);
    }

    await prisma.product.delete({ where: { id } });
    await catalogService.invalidateProductCache(product.slug);
  }

  async addImage(productId: string, url: string, altText?: string, isPrimary = false) {
    const product = await prisma.product.findUnique({ where: { id: productId } });

    if (!product) {
      throw new AppError('Товар не знайдено', 404);
    }

    if (isPrimary) {
      await prisma.productImage.updateMany({
        where: { productId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const maxOrder = await prisma.productImage.findFirst({
      where: { productId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const image = await prisma.productImage.create({
      data: {
        productId,
        url,
        altText,
        isPrimary,
        sortOrder: (maxOrder?.sortOrder ?? -1) + 1,
      },
    });

    await catalogService.invalidateProductCache(product.slug);

    return image;
  }

  async deleteImage(productId: string, imageId: string) {
    const image = await prisma.productImage.findFirst({
      where: { id: imageId, productId },
      include: { product: true },
    });

    if (!image) {
      throw new AppError('Зображення не знайдено', 404);
    }

    await prisma.productImage.delete({ where: { id: imageId } });
    await catalogService.invalidateProductCache(image.product.slug);
  }

  async addVariant(productId: string, input: CreateVariantInput) {
    const product = await prisma.product.findUnique({ where: { id: productId } });

    if (!product) {
      throw new AppError('Товар не знайдено', 404);
    }

    const existingVariant = await prisma.productVariant.findUnique({
      where: {
        productId_size_color: {
          productId,
          size: input.size,
          color: input.color,
        },
      },
    });

    if (existingVariant) {
      throw new AppError('Варіант з такими параметрами вже існує', 400);
    }

    const variant = await prisma.productVariant.create({
      data: {
        productId,
        size: input.size,
        color: input.color,
        stock: input.stock,
        priceAddon: input.priceAddon ?? 0,
      },
    });

    await catalogService.invalidateProductCache(product.slug);

    return variant;
  }

  async updateVariant(
    productId: string,
    variantId: string,
    input: Partial<CreateVariantInput>
  ) {
    const variant = await prisma.productVariant.findFirst({
      where: { id: variantId, productId },
      include: { product: true },
    });

    if (!variant) {
      throw new AppError('Варіант не знайдено', 404);
    }

    const updated = await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        stock: input.stock,
        priceAddon: input.priceAddon,
      },
    });

    await catalogService.invalidateProductCache(variant.product.slug);

    return updated;
  }

  async deleteVariant(productId: string, variantId: string) {
    const variant = await prisma.productVariant.findFirst({
      where: { id: variantId, productId },
      include: { product: true },
    });

    if (!variant) {
      throw new AppError('Варіант не знайдено', 404);
    }

    await prisma.productVariant.delete({ where: { id: variantId } });
    await catalogService.invalidateProductCache(variant.product.slug);
  }
}

export const adminProductService = new AdminProductService();
