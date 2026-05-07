"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const prisma_js_1 = require("../config/prisma.js");
const password_js_1 = require("../utils/password.js");
const jwt_js_1 = require("../utils/jwt.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const MAX_SESSIONS = 5;
class AuthService {
    async register(input) {
        const existingUser = await prisma_js_1.prisma.user.findUnique({
            where: { email: input.email.toLowerCase() },
        });
        if (existingUser) {
            throw new errorHandler_js_1.AppError('Користувач з таким email вже існує', 400);
        }
        const passwordHash = await (0, password_js_1.hashPassword)(input.password);
        const user = await prisma_js_1.prisma.user.create({
            data: {
                email: input.email.toLowerCase(),
                passwordHash,
                firstName: input.firstName,
                lastName: input.lastName,
                phone: input.phone,
                cart: {
                    create: {},
                },
            },
        });
        return this.createSession(user.id, user.role);
    }
    async login(input) {
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { email: input.email.toLowerCase() },
        });
        if (!user) {
            throw new errorHandler_js_1.AppError('Невірний email або пароль', 401);
        }
        if (user.status === 'BANNED') {
            throw new errorHandler_js_1.AppError('Ваш акаунт заблоковано', 403);
        }
        const isValidPassword = await (0, password_js_1.verifyPassword)(user.passwordHash, input.password);
        if (!isValidPassword) {
            throw new errorHandler_js_1.AppError('Невірний email або пароль', 401);
        }
        return this.createSession(user.id, user.role);
    }
    async logout(refreshToken) {
        await prisma_js_1.prisma.refreshToken.deleteMany({
            where: { token: refreshToken },
        });
    }
    async refreshTokens(refreshToken) {
        const storedToken = await prisma_js_1.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });
        if (!storedToken) {
            throw new errorHandler_js_1.AppError('Недійсний refresh token', 401);
        }
        if (storedToken.expiresAt < new Date()) {
            await prisma_js_1.prisma.refreshToken.delete({ where: { id: storedToken.id } });
            throw new errorHandler_js_1.AppError('Термін дії refresh token закінчився', 401);
        }
        if (storedToken.user.status === 'BANNED') {
            throw new errorHandler_js_1.AppError('Ваш акаунт заблоковано', 403);
        }
        try {
            (0, jwt_js_1.verifyRefreshToken)(refreshToken);
        }
        catch {
            await prisma_js_1.prisma.refreshToken.delete({ where: { id: storedToken.id } });
            throw new errorHandler_js_1.AppError('Недійсний refresh token', 401);
        }
        // Rotate refresh token
        await prisma_js_1.prisma.refreshToken.delete({ where: { id: storedToken.id } });
        return this.createSession(storedToken.userId, storedToken.user.role);
    }
    async getMe(userId) {
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                avatarUrl: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new errorHandler_js_1.AppError('Користувача не знайдено', 404);
        }
        return user;
    }
    async createSession(userId, role) {
        // Limit sessions
        const sessions = await prisma_js_1.prisma.refreshToken.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
        });
        if (sessions.length >= MAX_SESSIONS) {
            const sessionsToDelete = sessions.slice(0, sessions.length - MAX_SESSIONS + 1);
            await prisma_js_1.prisma.refreshToken.deleteMany({
                where: {
                    id: { in: sessionsToDelete.map((s) => s.id) },
                },
            });
        }
        const accessToken = (0, jwt_js_1.generateAccessToken)({ userId, role });
        const refreshToken = (0, jwt_js_1.generateRefreshToken)({ userId, role });
        await prisma_js_1.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId,
                expiresAt: (0, jwt_js_1.getRefreshTokenExpiry)(),
            },
        });
        return { accessToken, refreshToken };
    }
    async forgotPassword(email) {
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user) {
            // Don't reveal if email exists
            return;
        }
        // TODO: Implement password reset email functionality
    }
    async resetPassword(token, newPassword) {
        // TODO: Verify reset token and update password
        throw new errorHandler_js_1.AppError('Функція тимчасово недоступна', 501);
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map