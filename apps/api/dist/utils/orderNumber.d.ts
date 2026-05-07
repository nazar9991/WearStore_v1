import { Prisma } from '@prisma/client';
export declare const generateOrderNumber: (tx?: Prisma.TransactionClient) => Promise<string>;
export declare const generateUniqueOrderNumber: () => Promise<string>;
export interface ParsedOrderNumber {
    prefix: string;
    year: number;
    sequence: number;
}
export declare const parseOrderNumber: (orderNumber: string) => ParsedOrderNumber | null;
//# sourceMappingURL=orderNumber.d.ts.map