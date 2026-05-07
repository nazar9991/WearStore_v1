import { Prisma } from '@prisma/client';
export declare class CartService {
    getCart(userId: string): Promise<{
        id: string;
        items: {
            id: string;
            quantity: number;
            variant: {
                id: string;
                size: import("@prisma/client").$Enums.Size;
                color: string;
                stock: number;
            };
            product: {
                id: string;
                name: string;
                slug: string;
                basePrice: Prisma.Decimal;
                salePrice: Prisma.Decimal | null;
                image: string | null;
            };
            unitPrice: Prisma.Decimal;
            totalPrice: Prisma.Decimal;
        }[];
        subtotal: Prisma.Decimal;
        itemCount: number;
    }>;
    addItem(userId: string, variantId: string, quantity: number): Promise<{
        id: string;
        items: {
            id: string;
            quantity: number;
            variant: {
                id: string;
                size: import("@prisma/client").$Enums.Size;
                color: string;
                stock: number;
            };
            product: {
                id: string;
                name: string;
                slug: string;
                basePrice: Prisma.Decimal;
                salePrice: Prisma.Decimal | null;
                image: string | null;
            };
            unitPrice: Prisma.Decimal;
            totalPrice: Prisma.Decimal;
        }[];
        subtotal: Prisma.Decimal;
        itemCount: number;
    }>;
    updateItemQuantity(userId: string, itemId: string, quantity: number): Promise<{
        id: string;
        items: {
            id: string;
            quantity: number;
            variant: {
                id: string;
                size: import("@prisma/client").$Enums.Size;
                color: string;
                stock: number;
            };
            product: {
                id: string;
                name: string;
                slug: string;
                basePrice: Prisma.Decimal;
                salePrice: Prisma.Decimal | null;
                image: string | null;
            };
            unitPrice: Prisma.Decimal;
            totalPrice: Prisma.Decimal;
        }[];
        subtotal: Prisma.Decimal;
        itemCount: number;
    }>;
    removeItem(userId: string, itemId: string): Promise<{
        id: string;
        items: {
            id: string;
            quantity: number;
            variant: {
                id: string;
                size: import("@prisma/client").$Enums.Size;
                color: string;
                stock: number;
            };
            product: {
                id: string;
                name: string;
                slug: string;
                basePrice: Prisma.Decimal;
                salePrice: Prisma.Decimal | null;
                image: string | null;
            };
            unitPrice: Prisma.Decimal;
            totalPrice: Prisma.Decimal;
        }[];
        subtotal: Prisma.Decimal;
        itemCount: number;
    }>;
    clearCart(userId: string): Promise<{
        id: string;
        items: {
            id: string;
            quantity: number;
            variant: {
                id: string;
                size: import("@prisma/client").$Enums.Size;
                color: string;
                stock: number;
            };
            product: {
                id: string;
                name: string;
                slug: string;
                basePrice: Prisma.Decimal;
                salePrice: Prisma.Decimal | null;
                image: string | null;
            };
            unitPrice: Prisma.Decimal;
            totalPrice: Prisma.Decimal;
        }[];
        subtotal: Prisma.Decimal;
        itemCount: number;
    }>;
    applyPromoCode(userId: string, code: string): Promise<{
        code: string;
        type: import("@prisma/client").$Enums.PromoCodeType;
        value: Prisma.Decimal;
        discount: Prisma.Decimal;
        subtotal: Prisma.Decimal;
        total: Prisma.Decimal;
    }>;
}
export declare const cartService: CartService;
//# sourceMappingURL=cart.service.d.ts.map