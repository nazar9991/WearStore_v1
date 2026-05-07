import { prisma } from '../config/prisma.js';
import { Prisma } from '@prisma/client';

export const generateOrderNumber = async (tx?: Prisma.TransactionClient): Promise<string> => {
  const client = tx || prisma;
  const year = new Date().getFullYear();

  const lastOrder = await client.order.findFirst({
    where: {
      orderNumber: {
        startsWith: `WS-${year}-`,
      },
    },
    orderBy: {
      orderNumber: 'desc',
    },
    select: {
      orderNumber: true,
    },
  });

  let nextNumber = 1;

  if (lastOrder) {
    const parts = lastOrder.orderNumber.split('-');
    const lastNumber = parseInt(parts[2], 10);
    nextNumber = lastNumber + 1;
  }

  return `WS-${year}-${nextNumber.toString().padStart(6, '0')}`;
};

export const generateUniqueOrderNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `WS-${year}-${timestamp}${random}`;
};

export interface ParsedOrderNumber {
  prefix: string;
  year: number;
  sequence: number;
}

export const parseOrderNumber = (orderNumber: string): ParsedOrderNumber | null => {
  const match = orderNumber.match(/^(WS)-(\d{4})-(\d+)$/);
  if (!match) return null;

  const [, prefix, yearStr, sequenceStr] = match;
  const year = parseInt(yearStr, 10);
  const sequence = parseInt(sequenceStr, 10);

  if (isNaN(year) || isNaN(sequence)) return null;

  return { prefix, year, sequence };
};
