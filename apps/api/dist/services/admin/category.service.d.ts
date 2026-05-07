interface CreateCategoryInput {
    name: string;
    description?: string;
    imageUrl?: string;
    parentId?: string;
    sortOrder?: number;
    isActive?: boolean;
}
interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
}
export declare class AdminCategoryService {
    getCategories(): Promise<({
        _count: {
            children: number;
            products: number;
        };
        parent: {
            id: string;
            name: string;
            slug: string;
        } | null;
    } & {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        imageUrl: string | null;
        parentId: string | null;
        sortOrder: number;
        isActive: boolean;
    })[]>;
    createCategory(input: CreateCategoryInput): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        imageUrl: string | null;
        parentId: string | null;
        sortOrder: number;
        isActive: boolean;
    }>;
    updateCategory(id: string, input: UpdateCategoryInput): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        imageUrl: string | null;
        parentId: string | null;
        sortOrder: number;
        isActive: boolean;
    }>;
    deleteCategory(id: string): Promise<void>;
    reorderCategories(orders: {
        id: string;
        sortOrder: number;
    }[]): Promise<void>;
}
export declare const adminCategoryService: AdminCategoryService;
export {};
//# sourceMappingURL=category.service.d.ts.map