import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../../src/utils/password';

describe('Password Utils', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should produce different hashes for the same password', async () => {
      const password = 'testPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty string', async () => {
      const hash = await hashPassword('');
      expect(hash).toBeDefined();
    });

    it('should handle long passwords', async () => {
      const longPassword = 'a'.repeat(1000);
      const hash = await hashPassword(longPassword);
      expect(hash).toBeDefined();
    });

    it('should handle unicode characters', async () => {
      const password = 'пароль123🔐';
      const hash = await hashPassword(password);
      expect(hash).toBeDefined();
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(hash, password);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(hash, 'wrongPassword');

      expect(isValid).toBe(false);
    });

    it('should reject similar but different passwords', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);

      expect(await verifyPassword(hash, 'testPassword124')).toBe(false);
      expect(await verifyPassword(hash, 'TestPassword123')).toBe(false);
      expect(await verifyPassword(hash, 'testPassword123 ')).toBe(false);
    });

    it('should handle invalid hash gracefully', async () => {
      const isValid = await verifyPassword('invalid-hash', 'password');
      expect(isValid).toBe(false);
    });

    it('should handle empty hash gracefully', async () => {
      const isValid = await verifyPassword('', 'password');
      expect(isValid).toBe(false);
    });

    it('should verify unicode passwords', async () => {
      const password = 'пароль123🔐';
      const hash = await hashPassword(password);

      expect(await verifyPassword(hash, password)).toBe(true);
      expect(await verifyPassword(hash, 'пароль123')).toBe(false);
    });
  });
});
