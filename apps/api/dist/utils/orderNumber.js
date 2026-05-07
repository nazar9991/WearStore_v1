"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseOrderNumber = exports.generateUniqueOrderNumber = exports.generateOrderNumber = void 0;
const prisma_js_1 = require("../config/prisma.js");
const generateOrderNumber = async (tx) => {
    const client = tx || prisma_js_1.prisma;
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
exports.generateOrderNumber = generateOrderNumber;
const generateUniqueOrderNumber = async () => {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `WS-${year}-${timestamp}${random}`;
};
exports.generateUniqueOrderNumber = generateUniqueOrderNumber;
const parseOrderNumber = (orderNumber) => {
    const match = orderNumber.match(/^(WS)-(\d{4})-(\d+)$/);
    if (!match)
        return null;
    const [, prefix, yearStr, sequenceStr] = match;
    const year = parseInt(yearStr, 10);
    const sequence = parseInt(sequenceStr, 10);
    if (isNaN(year) || isNaN(sequence))
        return null;
    return { prefix, year, sequence };
};
exports.parseOrderNumber = parseOrderNumber;
//# sourceMappingURL=orderNumber.js.map