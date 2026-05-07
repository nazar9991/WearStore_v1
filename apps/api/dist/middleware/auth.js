"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.optionalAuth = exports.authenticate = void 0;
const jwt_js_1 = require("../utils/jwt.js");
const prisma_js_1 = require("../config/prisma.js");
const errorHandler_js_1 = require("./errorHandler.js");
const authenticate = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errorHandler_js_1.AppError('Необхідна авторизація', 401);
        }
        const token = authHeader.substring(7);
        const payload = (0, jwt_js_1.verifyAccessToken)(token);
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, role: true, status: true },
        });
        if (!user) {
            throw new errorHandler_js_1.AppError('Користувача не знайдено', 401);
        }
        if (user.status === 'BANNED') {
            throw new errorHandler_js_1.AppError('Ваш акаунт заблоковано', 403);
        }
        req.user = {
            userId: user.id,
            role: user.role,
        };
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authenticate = authenticate;
const optionalAuth = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const payload = (0, jwt_js_1.verifyAccessToken)(token);
                const user = await prisma_js_1.prisma.user.findUnique({
                    where: { id: payload.userId },
                    select: { id: true, role: true, status: true },
                });
                if (user && user.status === 'ACTIVE') {
                    req.user = {
                        userId: user.id,
                        role: user.role,
                    };
                }
            }
            catch {
                // Token invalid, continue as guest
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.optionalAuth = optionalAuth;
const requireRole = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new errorHandler_js_1.AppError('Необхідна авторизація', 401));
        }
        if (!roles.includes(req.user.role)) {
            return next(new errorHandler_js_1.AppError('Недостатньо прав доступу', 403));
        }
        next();
    };
};
exports.requireRole = requireRole;
//# sourceMappingURL=auth.js.map