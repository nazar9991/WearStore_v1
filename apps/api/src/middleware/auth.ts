import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { verifyAccessToken } from '../utils/jwt.js';
import { prisma } from '../config/prisma.js';
import { AppError } from './errorHandler.js';

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Необхідна авторизація', 401);
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true, status: true },
    });

    if (!user) {
      throw new AppError('Користувача не знайдено', 401);
    }

    if (user.status === 'BANNED') {
      throw new AppError('Ваш акаунт заблоковано', 403);
    }

    req.user = {
      userId: user.id,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const payload = verifyAccessToken(token);
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { id: true, role: true, status: true },
        });

        if (user && user.status === 'ACTIVE') {
          req.user = {
            userId: user.id,
            role: user.role,
          };
        }
      } catch {
        // Token invalid, continue as guest
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Необхідна авторизація', 401));
    }

    if (!roles.includes(req.user.role as UserRole)) {
      return next(new AppError('Недостатньо прав доступу', 403));
    }

    next();
  };
};
