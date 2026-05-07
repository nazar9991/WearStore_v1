import { describe, it, expect } from 'vitest';
import { cn, formatPrice, formatDate } from '../../src/shared/lib/utils';

describe('Utility Functions', () => {
  describe('cn (classNames merger)', () => {
    it('merges class names', () => {
      const result = cn('class1', 'class2');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
    });

    it('handles conditional classes', () => {
      const result = cn('base', true && 'added', false && 'not-added');
      expect(result).toContain('base');
      expect(result).toContain('added');
      expect(result).not.toContain('not-added');
    });

    it('merges Tailwind classes correctly', () => {
      // tailwind-merge should handle conflicts
      const result = cn('px-2', 'px-4');
      expect(result).toBe('px-4');
    });

    it('handles undefined and null', () => {
      const result = cn('base', undefined, null, 'end');
      expect(result).toContain('base');
      expect(result).toContain('end');
    });

    it('handles empty strings', () => {
      const result = cn('base', '', 'end');
      expect(result).toContain('base');
      expect(result).toContain('end');
    });

    it('handles object syntax', () => {
      const result = cn({ active: true, disabled: false });
      expect(result).toContain('active');
      expect(result).not.toContain('disabled');
    });
  });

  describe('formatPrice', () => {
    it('formats price with UAH currency', () => {
      const result = formatPrice(1000);
      expect(result).toContain('1');
      expect(result).toContain('000');
      expect(result).toContain('₴');
    });

    it('rounds decimal prices to whole numbers', () => {
      // formatPrice uses minimumFractionDigits: 0, maximumFractionDigits: 0
      // so 1500.50 rounds to 1501
      const result = formatPrice(1500.50);
      expect(result).toContain('1');
      expect(result).toContain('501');
    });

    it('formats zero price', () => {
      const result = formatPrice(0);
      expect(result).toContain('0');
    });

    it('formats large prices', () => {
      const result = formatPrice(1000000);
      expect(result).toContain('1');
      expect(result).toContain('000');
      expect(result).toContain('000');
    });

    it('handles string input', () => {
      const result = formatPrice('1500');
      expect(result).toContain('1');
      expect(result).toContain('500');
    });
  });

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15T10:30:00');
      const result = formatDate(date);

      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('formats string date', () => {
      const result = formatDate('2024-06-20');

      expect(result).toContain('20');
      expect(result).toContain('2024');
    });

    it('handles ISO date string', () => {
      const result = formatDate('2024-03-10T14:25:00.000Z');

      expect(result).toContain('10');
      expect(result).toContain('2024');
    });
  });
});
