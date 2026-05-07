import { describe, it, expect } from 'vitest';
import { generateSlug, transliterate } from '../../src/utils/slug';

describe('Slug Utils', () => {
  describe('transliterate', () => {
    it('should transliterate Ukrainian characters', () => {
      expect(transliterate('Привіт')).toBe('pryvit');
      expect(transliterate('Київ')).toBe('kyyiv'); // К(k) + и(y) + ї(yi) + в(v) → 'kyyiv'
      expect(transliterate('Україна')).toBe('ukrayina');
    });

    it('should transliterate complex Ukrainian words', () => {
      expect(transliterate('їжачок')).toBe('yizhachok');
      expect(transliterate('щедрий')).toBe('shchedryy'); // й → y at the end
      expect(transliterate('юність')).toBe('yunist');
    });

    it('should handle mixed case', () => {
      expect(transliterate('Привіт СВІТ')).toBe('pryvit svit');
    });

    it('should preserve Latin characters', () => {
      expect(transliterate('Hello')).toBe('hello');
      expect(transliterate('Test123')).toBe('test123');
    });

    it('should handle empty string', () => {
      expect(transliterate('')).toBe('');
    });

    it('should handle special characters', () => {
      expect(transliterate('тест!')).toBe('test!');
    });
  });

  describe('generateSlug', () => {
    it('should generate slug from Ukrainian text', () => {
      expect(generateSlug('Сукня елегант')).toBe('suknya-elehant');
      expect(generateSlug('Блуза шовкова')).toBe('bluza-shovkova');
    });

    it('should handle multiple spaces', () => {
      expect(generateSlug('Сукня   міді')).toBe('suknya-midi');
    });

    it('should remove special characters', () => {
      expect(generateSlug('Сукня "Елегант"!')).toBe('suknya-elehant');
      expect(generateSlug('Блуза (нова)')).toBe('bluza-nova');
    });

    it('should convert to lowercase', () => {
      expect(generateSlug('СУКНЯ ЕЛЕГАНТ')).toBe('suknya-elehant');
    });

    it('should handle numbers', () => {
      expect(generateSlug('Модель 2024')).toBe('model-2024');
    });

    it('should trim leading/trailing hyphens', () => {
      expect(generateSlug('  Сукня  ')).toBe('suknya');
      expect(generateSlug('---Сукня---')).toBe('suknya');
    });

    it('should collapse multiple hyphens', () => {
      expect(generateSlug('Сукня - - міді')).toBe('suknya-midi');
    });

    it('should handle English text', () => {
      expect(generateSlug('Summer Dress')).toBe('summer-dress');
    });

    it('should handle mixed Ukrainian and English', () => {
      expect(generateSlug('Сукня Dress')).toBe('suknya-dress');
    });

    it('should handle apostrophes', () => {
      expect(generateSlug("Кур'єр")).toBe('kuryer');
    });
  });
});
