import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';

export class AppError extends Error {
  public isOperational: boolean;

  constructor(
    public message: string,
    public statusCode: number = 500,
    isOperational: boolean = true,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'AppError';
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
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
