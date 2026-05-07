import { Request, Response, NextFunction } from 'express';
export declare class AppError extends Error {
    message: string;
    statusCode: number;
    errors?: Record<string, string[]> | undefined;
    isOperational: boolean;
    constructor(message: string, statusCode?: number, isOperational?: boolean, errors?: Record<string, string[]> | undefined);
}
export declare const errorHandler: (err: Error, req: Request, res: Response, _next: NextFunction) => Response<any, Record<string, any>>;
//# sourceMappingURL=errorHandler.d.ts.map