"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const index_js_1 = require("./config/index.js");
const logger_js_1 = require("./utils/logger.js");
const errorHandler_js_1 = require("./middleware/errorHandler.js");
const rateLimit_js_1 = require("./middleware/rateLimit.js");
const index_js_2 = __importDefault(require("./routes/index.js"));
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use((0, cors_1.default)({
    origin: index_js_1.config.frontendUrl,
    credentials: true,
}));
// Serve static files from uploads directory
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
// Rate limiting
app.use(rateLimit_js_1.guestRateLimit);
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Request logging
app.use((req, res, next) => {
    logger_js_1.logger.info(`${req.method} ${req.path}`);
    next();
});
// API routes
app.use('/api', index_js_2.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ендпоінт не знайдено',
    });
});
// Error handler
app.use(errorHandler_js_1.errorHandler);
const server = app.listen(index_js_1.config.port, () => {
    logger_js_1.logger.info(`Server running on port ${index_js_1.config.port}`);
    logger_js_1.logger.info(`Environment: ${index_js_1.config.env}`);
});
// Graceful shutdown
const shutdown = () => {
    logger_js_1.logger.info('Shutting down gracefully...');
    server.close(() => {
        logger_js_1.logger.info('Server closed');
        process.exit(0);
    });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
exports.default = app;
//# sourceMappingURL=index.js.map