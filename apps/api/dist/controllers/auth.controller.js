"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.resetPassword = exports.forgotPassword = exports.refresh = exports.logout = exports.login = exports.register = void 0;
const zod_1 = require("zod");
const auth_service_js_1 = require("../services/auth.service.js");
const index_js_1 = require("../config/index.js");
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Невірний формат email'),
    password: zod_1.z.string().min(8, 'Пароль повинен містити мінімум 8 символів'),
    firstName: zod_1.z.string().min(2, "Ім'я повинно містити мінімум 2 символи"),
    lastName: zod_1.z.string().min(2, 'Прізвище повинно містити мінімум 2 символи'),
    phone: zod_1.z.string().optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Невірний формат email'),
    password: zod_1.z.string().min(1, 'Пароль обов\'язковий'),
});
const register = async (req, res, next) => {
    try {
        const input = registerSchema.parse(req.body);
        const tokens = await auth_service_js_1.authService.register(input);
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: index_js_1.config.env === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.status(201).json({
            success: true,
            data: { accessToken: tokens.accessToken },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const input = loginSchema.parse(req.body);
        const tokens = await auth_service_js_1.authService.login(input);
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: index_js_1.config.env === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.json({
            success: true,
            data: { accessToken: tokens.accessToken },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            await auth_service_js_1.authService.logout(refreshToken);
        }
        res.clearCookie('refreshToken');
        res.json({ success: true, message: 'Вихід виконано успішно' });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
const refresh = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token не знайдено',
            });
        }
        const tokens = await auth_service_js_1.authService.refreshTokens(refreshToken);
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: index_js_1.config.env === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.json({
            success: true,
            data: { accessToken: tokens.accessToken },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.refresh = refresh;
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = zod_1.z.object({ email: zod_1.z.string().email() }).parse(req.body);
        await auth_service_js_1.authService.forgotPassword(email);
        res.json({
            success: true,
            message: 'Якщо email існує, ви отримаєте лист для відновлення пароля',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = zod_1.z
            .object({
            token: zod_1.z.string(),
            password: zod_1.z.string().min(8),
        })
            .parse(req.body);
        await auth_service_js_1.authService.resetPassword(token, password);
        res.json({
            success: true,
            message: 'Пароль успішно змінено',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.resetPassword = resetPassword;
const getMe = async (req, res, next) => {
    try {
        const user = await auth_service_js_1.authService.getMe(req.user.userId);
        res.json({ success: true, data: user });
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
//# sourceMappingURL=auth.controller.js.map