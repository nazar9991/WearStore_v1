import { Request, Response, NextFunction } from 'express';
import { wishlistService } from '../services/wishlist.service.js';

export const getWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wishlist = await wishlistService.getWishlist(req.user!.userId);
    res.json({ success: true, data: wishlist });
  } catch (error) {
    next(error);
  }
};

export const addToWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const wishlist = await wishlistService.addToWishlist(req.user!.userId, productId);
    res.json({ success: true, data: wishlist });
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const wishlist = await wishlistService.removeFromWishlist(req.user!.userId, productId);
    res.json({ success: true, data: wishlist });
  } catch (error) {
    next(error);
  }
};
