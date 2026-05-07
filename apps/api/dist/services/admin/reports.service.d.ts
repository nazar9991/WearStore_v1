export declare class AdminReportsService {
    getDashboard(): Promise<{
        orders: {
            total: number;
            today: number;
            thisMonth: number;
            pending: number;
        };
        revenue: {
            total: number | import("@prisma/client/runtime/library").Decimal;
            thisMonth: number | import("@prisma/client/runtime/library").Decimal;
        };
        products: {
            total: number;
            lowStock: number;
        };
        users: {
            total: number;
            newThisMonth: number;
        };
    }>;
    getSalesReport(startDate: Date, endDate: Date): Promise<{
        revenue: number;
        orders: number;
        discount: number;
        date: string;
    }[]>;
    getTopProducts(limit?: number, startDate?: Date, endDate?: Date): Promise<{
        productId: any;
        name: any;
        image: any;
        soldQuantity: number;
        revenue: number | import("@prisma/client/runtime/library").Decimal;
    }[]>;
    getLowStockProducts(threshold?: number, limit?: number): Promise<({
        product: {
            id: string;
            name: string;
            slug: string;
            sku: string;
        };
    } & {
        id: string;
        productId: string;
        size: import("@prisma/client").$Enums.Size;
        color: string;
        stock: number;
        priceAddon: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    getCustomersReport(startDate?: Date, endDate?: Date): Promise<{
        total: number;
        new: number;
        topCustomers: {
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            } | null;
            ordersCount: number;
            totalSpent: number | import("@prisma/client/runtime/library").Decimal;
        }[];
    }>;
}
export declare const adminReportsService: AdminReportsService;
//# sourceMappingURL=reports.service.d.ts.map