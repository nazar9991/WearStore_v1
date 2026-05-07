import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
const productsDir = path.join(uploadsDir, 'products');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}

// Configure multer for memory storage (we'll process with sharp)
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Недопустимий формат файлу. Дозволені: JPEG, PNG, WebP, GIF'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

export interface ProcessedImage {
  filename: string;
  url: string;
  width: number;
  height: number;
}

export async function processAndSaveImage(
  file: Express.Multer.File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  } = {}
): Promise<ProcessedImage> {
  const { maxWidth = 1200, maxHeight = 1600, quality = 85 } = options;

  const filename = `${uuidv4()}.webp`;
  const filepath = path.join(productsDir, filename);

  // Process image with sharp
  const image = sharp(file.buffer);
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

    const resizedMetadata = await sharp(resized).metadata();
    width = resizedMetadata.width || width;
    height = resizedMetadata.height || height;

    await sharp(resized).toFile(filepath);
  } else {
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

export async function deleteImageFile(url: string): Promise<void> {
  if (!url.startsWith('/uploads/products/')) {
    return; // Don't delete external URLs
  }

  const filename = path.basename(url);
  const filepath = path.join(productsDir, filename);

  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
}
