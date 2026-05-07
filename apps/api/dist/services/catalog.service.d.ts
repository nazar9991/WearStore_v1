import { Prisma, Size } from '@prisma/client';
interface GetProductsInput {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sizes?: Size[];
    colors?: string[];
    inStock?: boolean;
    onSale?: boolean;
    sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
    page?: number;
    limit?: number;
}
export declare class CatalogService {
    getCategories(): Promise<any>;
    getCategoryBySlug(slug: string): Promise<{
        parent: {
            id: string;
            name: string;
            slug: string;
        } | null;
        children: {
            id: string;
            name: string;
            slug: string;
            description: string | null;
            imageUrl: string | null;
            parentId: string | null;
            sortOrder: number;
            isActive: boolean;
        }[];
    } & {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        imageUrl: string | null;
        parentId: string | null;
        sortOrder: number;
        isActive: boolean;
    }>;
    getProducts(input: GetProductsInput): Promise<{
        data: ({
            category: {
                id: string;
                name: string;
                slug: string;
            };
            images: {
                id: string;
                sortOrder: number;
                productId: string;
                url: string;
                altText: string | null;
                isPrimary: boolean;
            }[];
            variants: {
                size: import("@prisma/client").$Enums.Size;
                color: string;
                stock: number;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            description: string;
            isActive: boolean;
            basePrice: Prisma.Decimal;
            salePrice: Prisma.Decimal | null;
            sku: string;
            shortDescription: string | null;
            categoryId: string;
            material: string | null;
            careInstructions: string | null;
            isFeatured: boolean;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    getProductBySlug(slug: string): Promise<any>;
    getFeaturedProducts(limit?: number): Promise<any>;
    searchProducts(query: string, page?: number, limit?: number): Promise<{
        data: ({
            category: {
                id: string;
                name: string;
                slug: string;
            };
            images: {
                id: string;
                sortOrder: number;
                productId: string;
                url: string;
                altText: string | null;
                isPrimary: boolean;
            }[];
            variants: {
                size: import("@prisma/client").$Enums.Size;
                color: string;
                stock: number;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            description: string;
            isActive: boolean;
            basePrice: Prisma.Decimal;
            salePrice: Prisma.Decimal | null;
            sku: string;
            shortDescription: string | null;
            categoryId: string;
            material: string | null;
            careInstructions: string | null;
            isFeatured: boolean;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    invalidateProductCache(productSlug?: string): Promise<void>;
    invalidateCategoryCache(): Promise<void>;
}
export declare const catalogService: CatalogService;
export {};
//# sourceMappingURL=catalog.service.d.ts.map