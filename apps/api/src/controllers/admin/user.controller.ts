import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UserRole, UserStatus } from '@prisma/client';
import { adminUserService } from '../../services/admin/user.service.js';

const getUsersSchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  search: z.string().optional(),
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().optional(),
});

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = getUsersSchema.parse(req.query);
    const result = await adminUserService.getUsers(input);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await adminUserService.getUserById(id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { role } = z.object({ role: z.nativeEnum(UserRole) }).parse(req.body);

    const user = await adminUserService.updateRole(id, role, req.user!.userId);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = z.object({ status: z.nativeEnum(UserStatus) }).parse(req.body);

    const user = await adminUserService.updateStatus(id, status, req.user!.userId);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await adminUserService.deleteUser(id, req.user!.userId);
    res.json({ success: true, message: 'Користувача видалено' });
  } catch (error) {
    next(error);
  }
};
