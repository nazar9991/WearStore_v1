import { Request, Response, NextFunction } from 'express';
export declare const getCart: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const addItem: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateItemQuantity: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const removeItem: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const clearCart: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const applyPromoCode: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=cart.controller.d.ts.map