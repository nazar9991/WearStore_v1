import multer from 'multer';
export declare const upload: multer.Multer;
export interface ProcessedImage {
    filename: string;
    url: string;
    width: number;
    height: number;
}
export declare function processAndSaveImage(file: Express.Multer.File, options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
}): Promise<ProcessedImage>;
export declare function deleteImageFile(url: string): Promise<void>;
//# sourceMappingURL=upload.d.ts.map