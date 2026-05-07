import { Request, Response, NextFunction } from 'express';
export declare const generateSku: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getProducts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getProductById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createProduct: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateProduct: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteProduct: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const addImage: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const uploadImage: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteImage: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const addVariant: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateVariant: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteVariant: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=product.controller.d.ts.map