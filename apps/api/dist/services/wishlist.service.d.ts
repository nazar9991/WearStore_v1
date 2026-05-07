export declare class WishlistService {
    getWishlist(userId: string): Promise<{
        id: string;
        addedAt: Date;
        product: {
            id: string;
            name: string;
            slug: string;
            basePrice: import("@prisma/client/runtime/library").Decimal;
            salePrice: import("@prisma/client/runtime/library").Decimal | null;
            image: string | null;
            category: {
                id: string;
                name: string;
                slug: string;
            };
            inStock: boolean;
            variants: {
                size: import("@prisma/client").$Enums.Size;
                color: string;
                stock: number;
            }[];
        };
    }[]>;
    addToWishlist(userId: string, productId: string): Promise<{
        id: string;
        addedAt: Date;
        product: {
            id: string;
            name: string;
            slug: string;
            basePrice: import("@prisma/client/runtime/library").Decimal;
            salePrice: import("@prisma/client/runtime/library").Decimal | null;
            image: string | null;
            category: {
                id: string;
                name: string;
                slug: string;
            };
            inStock: boolean;
            variants: {
                size: import("@prisma/client").$Enums.Size;
                color: string;
                stock: number;
            }[];
        };
    }[]>;
    removeFromWishlist(userId: string, productId: string): Promise<{
        id: string;
        addedAt: Date;
        product: {
            id: string;
            name: string;
            slug: string;
            basePrice: import("@prisma/client/runtime/library").Decimal;
            salePrice: import("@prisma/client/runtime/library").Decimal | null;
            image: string | null;
            category: {
                id: string;
                name: string;
                slug: string;
            };
            inStock: boolean;
            variants: {
                size: import("@prisma/client").$Enums.Size;
                color: string;
                stock: number;
            }[];
        };
    }[]>;
    isInWishlist(userId: string, productId: string): Promise<boolean>;
}
export declare const wishlistService: WishlistService;
//# sourceMappingURL=wishlist.service.d.ts.map