"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRefreshTokenExpiry = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_js_1 = require("../config/index.js");
const generateAccessToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, index_js_1.config.jwt.accessSecret, {
        expiresIn: index_js_1.config.jwt.accessExpiresIn,
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, index_js_1.config.jwt.refreshSecret, {
        expiresIn: index_js_1.config.jwt.refreshExpiresIn,
    });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyAccessToken = (token) => {
    return jsonwebtoken_1.default.verify(token, index_js_1.config.jwt.accessSecret);
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, index_js_1.config.jwt.refreshSecret);
};
exports.verifyRefreshToken = verifyRefreshToken;
const getRefreshTokenExpiry = () => {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
};
exports.getRefreshTokenExpiry = getRefreshTokenExpiry;
//# sourceMappingURL=jwt.js.map