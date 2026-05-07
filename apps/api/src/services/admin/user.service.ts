import { Prisma, UserRole, UserStatus } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

interface GetUsersInput {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export class AdminUserService {
  async getUsers(input: GetUsersInput) {
    const page = input.page || 1;
    const limit = input.limit || 20;
    const offset = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (input.role) {
      where.role = input.role;
    }

    if (input.status) {
      where.status = input.status;
    }

    if (input.search) {
      where.OR = [
        { email: { contains: input.search, mode: 'insensitive' } },
        { firstName: { contains: input.search, mode: 'insensitive' } },
        { lastName: { contains: input.search, mode: 'insensitive' } },
        { phone: { contains: input.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
          _count: {
            select: { orders: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users.map((u) => ({ ...u, ordersCount: u._count.orders })),
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

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        addresses: true,
        _count: {
          select: { orders: true, wishlistItems: true },
        },
      },
    });

    if (!user) {
      throw new AppError('Користувача не знайдено', 404);
    }

    return {
      ...user,
      ordersCount: user._count.orders,
      wishlistCount: user._count.wishlistItems,
    };
  }

  async updateRole(id: string, role: UserRole, currentUserId: string) {
    if (id === currentUserId) {
      throw new AppError('Ви не можете змінити свою роль', 400);
    }

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new AppError('Користувача не знайдено', 404);
    }

    return prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      },
    });
  }

  async updateStatus(id: string, status: UserStatus, currentUserId: string) {
    if (id === currentUserId) {
      throw new AppError('Ви не можете заблокувати себе', 400);
    }

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new AppError('Користувача не знайдено', 404);
    }

    if (user.role === 'ADMIN') {
      throw new AppError('Неможливо заблокувати адміністратора', 400);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      },
    });

    if (status === 'BANNED') {
      // Invalidate all sessions
      await prisma.refreshToken.deleteMany({ where: { userId: id } });
    }

    return updated;
  }

  async deleteUser(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new AppError('Ви не можете видалити себе', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: { select: { orders: true } },
      },
    });

    if (!user) {
      throw new AppError('Користувача не знайдено', 404);
    }

    if (user.role === 'ADMIN') {
      throw new AppError('Неможливо видалити адміністратора', 400);
    }

    // If user has orders, anonymize instead of delete (for order history)
    if (user._count.orders > 0) {
      await prisma.$transaction([
        // Delete related data that can be deleted
        prisma.refreshToken.deleteMany({ where: { userId: id } }),
        prisma.wishlistItem.deleteMany({ where: { userId: id } }),
        prisma.cart.deleteMany({ where: { userId: id } }),
        prisma.address.deleteMany({ where: { userId: id } }),
        // Anonymize user data but keep the record for order history
        prisma.user.update({
          where: { id },
          data: {
            email: `deleted_${id}@deleted.local`,
            firstName: 'Видалений',
            lastName: 'Користувач',
            phone: null,
            passwordHash: '',
            status: 'BANNED',
            avatarUrl: null,
          },
        }),
      ]);
    } else {
      // No orders - can fully delete
      await prisma.user.delete({ where: { id } });
    }
  }
}

export const adminUserService = new AdminUserService();
