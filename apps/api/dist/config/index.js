"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    API_PORT: zod_1.z.string().default('3001'),
    FRONTEND_URL: zod_1.z.string().default('http://localhost:5173'),
    API_URL: zod_1.z.string().default('http://localhost:3001'),
    DATABASE_URL: zod_1.z.string(),
    JWT_ACCESS_SECRET: zod_1.z.string().min(32),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32),
    LIQPAY_PUBLIC_KEY: zod_1.z.string().optional(),
    LIQPAY_PRIVATE_KEY: zod_1.z.string().optional(),
    S3_ENDPOINT: zod_1.z.string().optional(),
    S3_ACCESS_KEY: zod_1.z.string().optional(),
    S3_SECRET_KEY: zod_1.z.string().optional(),
    S3_BUCKET: zod_1.z.string().optional(),
    S3_PUBLIC_URL: zod_1.z.string().optional(),
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.string().optional(),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
    process.exit(1);
}
exports.config = {
    env: parsed.data.NODE_ENV,
    port: parseInt(parsed.data.API_PORT, 10),
    frontendUrl: parsed.data.FRONTEND_URL,
    apiUrl: parsed.data.API_URL,
    database: {
        url: parsed.data.DATABASE_URL,
    },
    jwt: {
        accessSecret: parsed.data.JWT_ACCESS_SECRET,
        refreshSecret: parsed.data.JWT_REFRESH_SECRET,
        accessExpiresIn: '15m',
        refreshExpiresIn: '7d',
    },
    liqpay: {
        publicKey: parsed.data.LIQPAY_PUBLIC_KEY,
        privateKey: parsed.data.LIQPAY_PRIVATE_KEY,
    },
    s3: {
        endpoint: parsed.data.S3_ENDPOINT,
        accessKey: parsed.data.S3_ACCESS_KEY,
        secretKey: parsed.data.S3_SECRET_KEY,
        bucket: parsed.data.S3_BUCKET,
        publicUrl: parsed.data.S3_PUBLIC_URL,
    },
    smtp: {
        host: parsed.data.SMTP_HOST,
        port: parsed.data.SMTP_PORT ? parseInt(parsed.data.SMTP_PORT, 10) : undefined,
        user: parsed.data.SMTP_USER,
        pass: parsed.data.SMTP_PASS,
    },
    rateLimit: {
        authenticated: 100,
        guest: 30,
        windowMs: 60 * 1000, // 1 minute
    },
    cache: {
        categories: 3600, // 1 hour
        productList: 300, // 5 minutes
        productDetail: 600, // 10 minutes
        session: 86400, // 24 hours
    },
};
//# sourceMappingURL=index.js.map