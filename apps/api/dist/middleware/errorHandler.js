"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
const zod_1 = require("zod");
const logger_js_1 = require("../utils/logger.js");
class AppError extends Error {
    message;
    statusCode;
    errors;
    isOperational;
    constructor(message, statusCode = 500, isOperational = true, errors) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.errors = errors;
        this.name = 'AppError';
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, _next) => {
    logger_js_1.logger.error(err);
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors,
        });
    }
    if (err instanceof zod_1.ZodError) {
        const errors = {};
        err.errors.forEach((e) => {
            const path = e.path.join('.');
            if (!errors[path]) {
                errors[path] = [];
            }
            errors[path].push(e.message);
        });
        return res.status(400).json({
            success: false,
            message: 'Помилка валідації даних',
            errors,
        });
    }
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Недійсний токен авторизації',
        });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Термін дії токена закінчився',
        });
    }
    return res.status(500).json({
        success: false,
        message: 'Внутрішня помилка сервера',
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map