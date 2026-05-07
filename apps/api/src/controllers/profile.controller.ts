import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { profileService } from '../services/profile.service.js';

const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
});

const addressSchema = z.object({
  label: z.string().min(1),
  city: z.string().min(1),
  street: z.string().min(1),
  building: z.string().min(1),
  apartment: z.string().optional(),
  postalCode: z.string().min(1),
  isDefault: z.boolean().optional(),
});

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await profileService.getProfile(req.user!.userId);
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = updateProfileSchema.parse(req.body);
    const profile = await profileService.updateProfile(req.user!.userId, input);
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = changePasswordSchema.parse(req.body);
    await profileService.changePassword(req.user!.userId, input);
    res.json({ success: true, message: 'Пароль успішно змінено' });
  } catch (error) {
    next(error);
  }
};

export const getAddresses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const addresses = await profileService.getAddresses(req.user!.userId);
    res.json({ success: true, data: addresses });
  } catch (error) {
    next(error);
  }
};

export const addAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = addressSchema.parse(req.body);
    const address = await profileService.addAddress(req.user!.userId, input);
    res.status(201).json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const input = addressSchema.parse(req.body);
    const address = await profileService.updateAddress(req.user!.userId, id, input);
    res.json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await profileService.deleteAddress(req.user!.userId, id);
    res.json({ success: true, message: 'Адресу видалено' });
  } catch (error) {
    next(error);
  }
};
