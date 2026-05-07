import { Prisma, Size } from '@prisma/client';
interface CreateProductInput {
    sku?: string;
    name: string;
    description: string;
    shortDescription?: string;
    categoryId: string;
    basePrice: number;
    salePrice?: number;
    material?: string;
    careInstructions?: string;
    isFeatured?: boolean;
    isActive?: boolean;
}
interface UpdateProductInput extends Partial<CreateProductInput> {
}
interface CreateVariantInput {
    size: Size;
    color: string;
    stock: number;
    priceAddon?: number;
}
export declare class AdminProductService {
    generateSku(categoryId?: string): Promise<string>;
    getProducts(page?: number, limit?: number, search?: string): Promise<{
        data: ({
            category: {
                id: string;
                name: string;
                slug: string;
            };
            _count: {
                variants: number;
            };
            images: {
                id: string;
                sortOrder: number;
                productId: string;
                url: string;
                altText: string | null;
                isPrimary: boolean;
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
    getProductById(id: string): Promise<{
        category: {
            id: string;
            name: string;
            slug: string;
            description: string | null;
            imageUrl: string | null;
            parentId: string | null;
            sortOrder: number;
            isActive: boolean;
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
            id: string;
            productId: string;
            size: import("@prisma/client").$Enums.Size;
            color: string;
            stock: number;
            priceAddon: Prisma.Decimal;
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
    }>;
    createProduct(input: CreateProductInput): Promise<{
        category: {
            id: string;
            name: string;
            slug: string;
            description: string | null;
            imageUrl: string | null;
            parentId: string | null;
            sortOrder: number;
            isActive: boolean;
        };
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
    }>;
    updateProduct(id: string, input: UpdateProductInput): Promise<{
        category: {
            id: string;
            name: string;
            slug: string;
            description: string | null;
            imageUrl: string | null;
            parentId: string | null;
            sortOrder: number;
            isActive: boolean;
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
            id: string;
            productId: string;
            size: import("@prisma/client").$Enums.Size;
            color: string;
            stock: number;
            priceAddon: Prisma.Decimal;
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
    }>;
    deleteProduct(id: string): Promise<void>;
    addImage(productId: string, url: string, altText?: string, isPrimary?: boolean): Promise<{
        id: string;
        sortOrder: number;
        productId: string;
        url: string;
        altText: string | null;
        isPrimary: boolean;
    }>;
    deleteImage(productId: string, imageId: string): Promise<void>;
    addVariant(productId: string, input: CreateVariantInput): Promise<{
        id: string;
        productId: string;
        size: import("@prisma/client").$Enums.Size;
        color: string;
        stock: number;
        priceAddon: Prisma.Decimal;
    }>;
    updateVariant(productId: string, variantId: string, input: Partial<CreateVariantInput>): Promise<{
        id: string;
        productId: string;
        size: import("@prisma/client").$Enums.Size;
        color: string;
        stock: number;
        priceAddon: Prisma.Decimal;
    }>;
    deleteVariant(productId: string, variantId: string): Promise<void>;
}
export declare const adminProductService: AdminProductService;
export {};
//# sourceMappingURL=product.service.d.ts.map