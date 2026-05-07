"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileService = exports.ProfileService = void 0;
const prisma_js_1 = require("../config/prisma.js");
const password_js_1 = require("../utils/password.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
class ProfileService {
    async getProfile(userId) {
        const user = await prisma_js_1.prisma.user.findUnique({
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
            throw new errorHandler_js_1.AppError('Користувача не знайдено', 404);
        }
        return {
            ...user,
            ordersCount: user._count.orders,
            wishlistCount: user._count.wishlistItems,
        };
    }
    async updateProfile(userId, input) {
        const user = await prisma_js_1.prisma.user.update({
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
    async changePassword(userId, input) {
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new errorHandler_js_1.AppError('Користувача не знайдено', 404);
        }
        const isValid = await (0, password_js_1.verifyPassword)(user.passwordHash, input.currentPassword);
        if (!isValid) {
            throw new errorHandler_js_1.AppError('Невірний поточний пароль', 400);
        }
        const newHash = await (0, password_js_1.hashPassword)(input.newPassword);
        await prisma_js_1.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newHash },
        });
        // Invalidate all sessions except current
        await prisma_js_1.prisma.refreshToken.deleteMany({
            where: { userId },
        });
    }
    async getAddresses(userId) {
        return prisma_js_1.prisma.address.findMany({
            where: { userId },
            orderBy: [{ isDefault: 'desc' }, { label: 'asc' }],
        });
    }
    async addAddress(userId, input) {
        if (input.isDefault) {
            await prisma_js_1.prisma.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }
        return prisma_js_1.prisma.address.create({
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
    async updateAddress(userId, addressId, input) {
        const address = await prisma_js_1.prisma.address.findFirst({
            where: { id: addressId, userId },
        });
        if (!address) {
            throw new errorHandler_js_1.AppError('Адресу не знайдено', 404);
        }
        if (input.isDefault) {
            await prisma_js_1.prisma.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }
        return prisma_js_1.prisma.address.update({
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
    async deleteAddress(userId, addressId) {
        const address = await prisma_js_1.prisma.address.findFirst({
            where: { id: addressId, userId },
        });
        if (!address) {
            throw new errorHandler_js_1.AppError('Адресу не знайдено', 404);
        }
        await prisma_js_1.prisma.address.delete({ where: { id: addressId } });
    }
}
exports.ProfileService = ProfileService;
exports.profileService = new ProfileService();
//# sourceMappingURL=profile.service.js.map