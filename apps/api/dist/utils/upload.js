"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
exports.processAndSaveImage = processAndSaveImage;
exports.deleteImageFile = deleteImageFile;
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
// Ensure uploads directory exists
const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
const productsDir = path_1.default.join(uploadsDir, 'products');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs_1.default.existsSync(productsDir)) {
    fs_1.default.mkdirSync(productsDir, { recursive: true });
}
// Configure multer for memory storage (we'll process with sharp)
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Недопустимий формат файлу. Дозволені: JPEG, PNG, WebP, GIF'));
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
});
async function processAndSaveImage(file, options = {}) {
    const { maxWidth = 1200, maxHeight = 1600, quality = 85 } = options;
    const filename = `${(0, uuid_1.v4)()}.webp`;
    const filepath = path_1.default.join(productsDir, filename);
    // Process image with sharp
    const image = (0, sharp_1.default)(file.buffer);
    const metadata = await image.metadata();
    let width = metadata.width || maxWidth;
    let height = metadata.height || maxHeight;
    // Resize if needed while maintaining aspect ratio
    if (width > maxWidth || height > maxHeight) {
        const resized = await image
            .resize(maxWidth, maxHeight, {
            fit: 'inside',
            withoutEnlargement: true,
        })
            .webp({ quality })
            .toBuffer();
        const resizedMetadata = await (0, sharp_1.default)(resized).metadata();
        width = resizedMetadata.width || width;
        height = resizedMetadata.height || height;
        await (0, sharp_1.default)(resized).toFile(filepath);
    }
    else {
        await image.webp({ quality }).toFile(filepath);
    }
    // Generate URL (relative to API)
    const url = `/uploads/products/${filename}`;
    return {
        filename,
        url,
        width,
        height,
    };
}
async function deleteImageFile(url) {
    if (!url.startsWith('/uploads/products/')) {
        return; // Don't delete external URLs
    }
    const filename = path_1.default.basename(url);
    const filepath = path_1.default.join(productsDir, filename);
    if (fs_1.default.existsSync(filepath)) {
        fs_1.default.unlinkSync(filepath);
    }
}
//# sourceMappingURL=upload.js.map