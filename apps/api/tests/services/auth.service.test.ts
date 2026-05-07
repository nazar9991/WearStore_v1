import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError } from '../../src/middleware/errorHandler';

// Mock dependencies
vi.mock('../../src/config/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    refreshToken: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock('../../src/utils/password', () => ({
  hashPassword: vi.fn().mockResolvedValue('hashed-password'),
  verifyPassword: vi.fn(),
}));

vi.mock('../../src/utils/jwt', () => ({
  generateAccessToken: vi.fn().mockReturnValue('access-token'),
  generateRefreshToken: vi.fn().mockReturnValue('refresh-token'),
  verifyRefreshToken: vi.fn(),
  getRefreshTokenExpiry: vi.fn().mockReturnValue(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
}));

import { AuthService } from '../../src/services/auth.service';
import { prisma } from '../../src/config/prisma';
import { hashPassword, verifyPassword } from '../../src/utils/password';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    vi.clearAllMocks();
  });

  describe('register', () => {
    const registerInput = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should register a new user successfully', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        role: 'CLIENT',
      } as any);
      vi.mocked(prisma.refreshToken.findMany).mockResolvedValue([]);

      const result = await authService.register(registerInput);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'existing-user',
        email: 'test@example.com',
      } as any);

      await expect(authService.register(registerInput)).rejects.toThrow(AppError);
      await expect(authService.register(registerInput)).rejects.toThrow('Користувач з таким email вже існує');
    });

    it('should lowercase email', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        role: 'CLIENT',
      } as any);
      vi.mocked(prisma.refreshToken.findMany).mockResolvedValue([]);

      await authService.register({ ...registerInput, email: 'TEST@EXAMPLE.COM' });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should hash the password', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        role: 'CLIENT',
      } as any);
      vi.mocked(prisma.refreshToken.findMany).mockResolvedValue([]);

      await authService.register(registerInput);

      expect(hashPassword).toHaveBeenCalledWith('password123');
    });
  });

  describe('login', () => {
    const loginInput = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully with correct credentials', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        status: 'ACTIVE',
        role: 'CLIENT',
      } as any);
      vi.mocked(verifyPassword).mockResolvedValue(true);
      vi.mocked(prisma.refreshToken.findMany).mockResolvedValue([]);

      const result = await authService.login(loginInput);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw error for non-existent user', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(authService.login(loginInput)).rejects.toThrow('Невірний email або пароль');
    });

    it('should throw error for wrong password', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        status: 'ACTIVE',
        role: 'CLIENT',
      } as any);
      vi.mocked(verifyPassword).mockResolvedValue(false);

      await expect(authService.login(loginInput)).rejects.toThrow('Невірний email або пароль');
    });

    it('should throw error for banned user', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        status: 'BANNED',
        role: 'CLIENT',
      } as any);

      await expect(authService.login(loginInput)).rejects.toThrow('Ваш акаунт заблоковано');
    });
  });

  describe('logout', () => {
    it('should delete refresh token', async () => {
      vi.mocked(prisma.refreshToken.deleteMany).mockResolvedValue({ count: 1 });

      await authService.logout('refresh-token');

      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { token: 'refresh-token' },
      });
    });
  });

  describe('getMe', () => {
    it('should return user data', async () => {
      const userData = {
        id: 'user-id',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: null,
        role: 'CLIENT',
        avatarUrl: null,
        createdAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(userData as any);

      const result = await authService.getMe('user-id');

      expect(result).toEqual(userData);
    });

    it('should throw error if user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(authService.getMe('invalid-id')).rejects.toThrow('Користувача не знайдено');
    });
  });
});
