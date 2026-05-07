import { prisma } from '../../config/prisma.js';
import { generateSlug, ensureUniqueSlug } from '../../utils/slug.js';
import { AppError } from '../../middleware/errorHandler.js';
import { catalogService } from '../catalog.service.js';

interface CreateCategoryInput {
  name: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
}

interface UpdateCategoryInput extends Partial<CreateCategoryInput> {}

export class AdminCategoryService {
  async getCategories() {
    return prisma.category.findMany({
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

  async createCategory(input: CreateCategoryInput) {
    if (input.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: input.parentId },
      });
      if (!parent) {
        throw new AppError('Батьківську категорію не знайдено', 404);
      }
    }

    const baseSlug = generateSlug(input.name);
    const slug = await ensureUniqueSlug(baseSlug, async (s) => {
      const existing = await prisma.category.findUnique({ where: { slug: s } });
      return !!existing;
    });

    const category = await prisma.category.create({
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

    await catalogService.invalidateCategoryCache();

    return category;
  }

  async updateCategory(id: string, input: UpdateCategoryInput) {
    const category = await prisma.category.findUnique({ where: { id } });

    if (!category) {
      throw new AppError('Категорію не знайдено', 404);
    }

    if (input.parentId) {
      if (input.parentId === id) {
        throw new AppError('Категорія не може бути батьківською для себе', 400);
      }

      const parent = await prisma.category.findUnique({
        where: { id: input.parentId },
      });
      if (!parent) {
        throw new AppError('Батьківську категорію не знайдено', 404);
      }

      // Check for circular reference
      let current = parent;
      while (current.parentId) {
        if (current.parentId === id) {
          throw new AppError('Циклічне посилання категорій недопустиме', 400);
        }
        const nextParent = await prisma.category.findUnique({
          where: { id: current.parentId },
        });
        if (!nextParent) break;
        current = nextParent;
      }
    }

    let slug = category.slug;
    if (input.name && input.name !== category.name) {
      const baseSlug = generateSlug(input.name);
      slug = await ensureUniqueSlug(baseSlug, async (s) => {
        if (s === category.slug) return false;
        const existing = await prisma.category.findUnique({ where: { slug: s } });
        return !!existing;
      });
    }

    const updated = await prisma.category.update({
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

    await catalogService.invalidateCategoryCache();

    return updated;
  }

  async deleteCategory(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true, children: true } },
      },
    });

    if (!category) {
      throw new AppError('Категорію не знайдено', 404);
    }

    if (category._count.products > 0) {
      throw new AppError(
        'Неможливо видалити категорію з товарами. Спочатку перемістіть товари.',
        400
      );
    }

    if (category._count.children > 0) {
      throw new AppError(
        'Неможливо видалити категорію з підкатегоріями. Спочатку видаліть підкатегорії.',
        400
      );
    }

    await prisma.category.delete({ where: { id } });
    await catalogService.invalidateCategoryCache();
  }

  async reorderCategories(orders: { id: string; sortOrder: number }[]) {
    await prisma.$transaction(
      orders.map((order) =>
        prisma.category.update({
          where: { id: order.id },
          data: { sortOrder: order.sortOrder },
        })
      )
    );

    await catalogService.invalidateCategoryCache();
  }
}

export const adminCategoryService = new AdminCategoryService();
