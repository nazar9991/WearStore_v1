import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';

export const guestRateLimit = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.guest,
  message: {
    success: false,
    message: 'Забагато запитів. Спробуйте пізніше.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimit = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authenticated,
  message: {
    success: false,
    message: 'Забагато запитів. Спробуйте пізніше.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: 'Забагато спроб. Спробуйте через 15 хвилин.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
