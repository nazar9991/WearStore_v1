import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock prisma before importing
vi.mock('../../src/config/prisma', () => ({
  prisma: {
    order: {
      findFirst: vi.fn(),
    },
  },
}));

import { generateOrderNumber, parseOrderNumber } from '../../src/utils/orderNumber';
import { prisma } from '../../src/config/prisma';

describe('Order Number Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateOrderNumber', () => {
    it('should generate order number with correct format', async () => {
      vi.mocked(prisma.order.findFirst).mockResolvedValue(null);

      const orderNumber = await generateOrderNumber();

      // Format: WS-YYYY-NNNNNN
      expect(orderNumber).toMatch(/^WS-\d{4}-\d{6}$/);
    });

    it('should include current year', async () => {
      vi.mocked(prisma.order.findFirst).mockResolvedValue(null);

      const orderNumber = await generateOrderNumber();
      const year = new Date().getFullYear().toString();

      expect(orderNumber).toContain(`WS-${year}`);
    });

    it('should start with 000001 when no previous orders', async () => {
      vi.mocked(prisma.order.findFirst).mockResolvedValue(null);

      const orderNumber = await generateOrderNumber();

      expect(orderNumber).toMatch(/-000001$/);
    });

    it('should increment from last order number', async () => {
      const year = new Date().getFullYear();
      vi.mocked(prisma.order.findFirst).mockResolvedValue({
        orderNumber: `WS-${year}-000005`,
      } as any);

      const orderNumber = await generateOrderNumber();

      expect(orderNumber).toMatch(/-000006$/);
    });

    it('should pad order number with zeros', async () => {
      const year = new Date().getFullYear();
      vi.mocked(prisma.order.findFirst).mockResolvedValue({
        orderNumber: `WS-${year}-000099`,
      } as any);

      const orderNumber = await generateOrderNumber();
      expect(orderNumber).toMatch(/-000100$/);
    });

    it('should handle large order counts', async () => {
      const year = new Date().getFullYear();
      vi.mocked(prisma.order.findFirst).mockResolvedValue({
        orderNumber: `WS-${year}-999999`,
      } as any);

      const orderNumber = await generateOrderNumber();
      expect(orderNumber).toMatch(/-1000000$/);
    });
  });

  describe('parseOrderNumber', () => {
    it('should parse valid order number', () => {
      const parsed = parseOrderNumber('WS-2024-000123');

      expect(parsed).toEqual({
        prefix: 'WS',
        year: 2024,
        sequence: 123,
      });
    });

    it('should parse order number with large sequence', () => {
      const parsed = parseOrderNumber('WS-2024-999999');

      expect(parsed).toEqual({
        prefix: 'WS',
        year: 2024,
        sequence: 999999,
      });
    });

    it('should parse order number without leading zeros', () => {
      const parsed = parseOrderNumber('WS-2025-1');

      expect(parsed).toEqual({
        prefix: 'WS',
        year: 2025,
        sequence: 1,
      });
    });

    it('should return null for invalid format', () => {
      expect(parseOrderNumber('invalid')).toBeNull();
      expect(parseOrderNumber('WS-2024')).toBeNull();
      expect(parseOrderNumber('XX-2024-000001')).toBeNull();
      expect(parseOrderNumber('')).toBeNull();
    });

    it('should return null for missing parts', () => {
      expect(parseOrderNumber('WS--000001')).toBeNull();
      expect(parseOrderNumber('-2024-000001')).toBeNull();
    });
  });
});
