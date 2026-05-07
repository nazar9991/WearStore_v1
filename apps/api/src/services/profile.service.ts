import { prisma } from '../config/prisma.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { AppError } from '../middleware/errorHandler.js';

interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

interface AddressInput {
  label: string;
  city: string;
  street: string;
  building: string;
  apartment?: string;
  postalCode: string;
  isDefault?: boolean;
}

export class ProfileService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            wishlistItems: true,
          },
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

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
      },
    });

    return user;
  }

  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('Користувача не знайдено', 404);
    }

    const isValid = await verifyPassword(user.passwordHash, input.currentPassword);
    if (!isValid) {
      throw new AppError('Невірний поточний пароль', 400);
    }

    const newHash = await hashPassword(input.newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    // Invalidate all sessions except current
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async getAddresses(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { label: 'asc' }],
    });
  }

  async addAddress(userId: string, input: AddressInput) {
    if (input.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.address.create({
      data: {
        userId,
        label: input.label,
        city: input.city,
        street: input.street,
        building: input.building,
        apartment: input.apartment,
        postalCode: input.postalCode,
        isDefault: input.isDefault || false,
      },
    });
  }

  async updateAddress(userId: string, addressId: string, input: AddressInput) {
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new AppError('Адресу не знайдено', 404);
    }

    if (input.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.address.update({
      where: { id: addressId },
      data: {
        label: input.label,
        city: input.city,
        street: input.street,
        building: input.building,
        apartment: input.apartment,
        postalCode: input.postalCode,
        isDefault: input.isDefault || false,
      },
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new AppError('Адресу не знайдено', 404);
    }

    await prisma.address.delete({ where: { id: addressId } });
  }
}

export const profileService = new ProfileService();
