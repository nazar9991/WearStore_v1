import { PromoCodeType } from '@prisma/client';
interface CreatePromoInput {
    code: string;
    type: PromoCodeType;
    value: number;
    minOrderAmount?: number;
    maxUses?: number;
    startsAt?: Date;
    expiresAt?: Date;
    isActive?: boolean;
}
interface UpdatePromoInput extends Partial<CreatePromoInput> {
}
export declare class AdminPromoService {
    getPromoCodes(page?: number, limit?: number): Promise<{
        data: {
            value: import("@prisma/client/runtime/library").Decimal;
            code: string;
            type: import("@prisma/client").$Enums.PromoCodeType;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            expiresAt: Date | null;
            isActive: boolean;
            minOrderAmount: import("@prisma/client/runtime/library").Decimal | null;
            maxUses: number | null;
            usedCount: number;
            startsAt: Date | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    createPromoCode(input: CreatePromoInput): Promise<{
        value: import("@prisma/client/runtime/library").Decimal;
        code: string;
        type: import("@prisma/client").$Enums.PromoCodeType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        expiresAt: Date | null;
        isActive: boolean;
        minOrderAmount: import("@prisma/client/runtime/library").Decimal | null;
        maxUses: number | null;
        usedCount: number;
        startsAt: Date | null;
    }>;
    updatePromoCode(id: string, input: UpdatePromoInput): Promise<{
        value: import("@prisma/client/runtime/library").Decimal;
        code: string;
        type: import("@prisma/client").$Enums.PromoCodeType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        expiresAt: Date | null;
        isActive: boolean;
        minOrderAmount: import("@prisma/client/runtime/library").Decimal | null;
        maxUses: number | null;
        usedCount: number;
        startsAt: Date | null;
    }>;
    deletePromoCode(id: string): Promise<void>;
}
export declare const adminPromoService: AdminPromoService;
export {};
//# sourceMappingURL=promo.service.d.ts.map