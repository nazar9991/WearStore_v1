import { describe, it, expect, beforeAll } from 'vitest';
import jwt from 'jsonwebtoken';

// Set env vars before importing jwt utils
process.env.JWT_ACCESS_SECRET = 'test-access-secret-key-min-32-characters';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-min-32-characters';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from '../../src/utils/jwt';

describe('JWT Utils', () => {
  const testPayload = { userId: 'test-user-123', role: 'CLIENT' };

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken(testPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format
    });

    it('should include userId in token', () => {
      const token = generateAccessToken(testPayload);
      const decoded = jwt.decode(token) as any;

      expect(decoded.userId).toBe(testPayload.userId);
    });

    it('should include role in token', () => {
      const token = generateAccessToken(testPayload);
      const decoded = jwt.decode(token) as any;

      expect(decoded.role).toBe(testPayload.role);
    });

    it('should generate different tokens for different users', () => {
      const token1 = generateAccessToken({ userId: 'user1', role: 'CLIENT' });
      const token2 = generateAccessToken({ userId: 'user2', role: 'CLIENT' });

      expect(token1).not.toBe(token2);
    });

    it('should handle different roles', () => {
      const clientToken = generateAccessToken({ userId: 'user1', role: 'CLIENT' });
      const adminToken = generateAccessToken({ userId: 'user1', role: 'ADMIN' });

      const clientDecoded = jwt.decode(clientToken) as any;
      const adminDecoded = jwt.decode(adminToken) as any;

      expect(clientDecoded.role).toBe('CLIENT');
      expect(adminDecoded.role).toBe('ADMIN');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken(testPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should be different from access token', () => {
      const accessToken = generateAccessToken(testPayload);
      const refreshToken = generateRefreshToken(testPayload);

      expect(accessToken).not.toBe(refreshToken);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      const token = generateAccessToken(testPayload);
      const payload = verifyAccessToken(token);

      expect(payload.userId).toBe(testPayload.userId);
      expect(payload.role).toBe(testPayload.role);
    });

    it('should throw on invalid token', () => {
      expect(() => verifyAccessToken('invalid-token')).toThrow();
    });

    it('should throw on tampered token', () => {
      const token = generateAccessToken(testPayload);
      const tamperedToken = token.slice(0, -5) + 'xxxxx';

      expect(() => verifyAccessToken(tamperedToken)).toThrow();
    });

    it('should throw on refresh token used as access token', () => {
      const refreshToken = generateRefreshToken(testPayload);

      expect(() => verifyAccessToken(refreshToken)).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', () => {
      const token = generateRefreshToken(testPayload);
      const payload = verifyRefreshToken(token);

      expect(payload.userId).toBe(testPayload.userId);
      expect(payload.role).toBe(testPayload.role);
    });

    it('should throw on invalid token', () => {
      expect(() => verifyRefreshToken('invalid-token')).toThrow();
    });

    it('should throw on access token used as refresh token', () => {
      const accessToken = generateAccessToken(testPayload);

      expect(() => verifyRefreshToken(accessToken)).toThrow();
    });
  });

  describe('getRefreshTokenExpiry', () => {
    it('should return a future date', () => {
      const expiry = getRefreshTokenExpiry();
      const now = new Date();

      expect(expiry).toBeInstanceOf(Date);
      expect(expiry.getTime()).toBeGreaterThan(now.getTime());
    });

    it('should be approximately 7 days in the future', () => {
      const expiry = getRefreshTokenExpiry();
      const now = new Date();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      const diff = expiry.getTime() - now.getTime();

      // Allow 1 second tolerance
      expect(diff).toBeGreaterThan(sevenDaysMs - 1000);
      expect(diff).toBeLessThan(sevenDaysMs + 1000);
    });
  });
});
