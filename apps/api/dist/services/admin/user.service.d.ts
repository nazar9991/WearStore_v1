import { UserRole, UserStatus } from '@prisma/client';
interface GetUsersInput {
    role?: UserRole;
    status?: UserStatus;
    search?: string;
    page?: number;
    limit?: number;
}
export declare class AdminUserService {
    getUsers(input: GetUsersInput): Promise<{
        data: {
            ordersCount: number;
            status: import("@prisma/client").$Enums.UserStatus;
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            createdAt: Date;
            _count: {
                orders: number;
            };
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
    getUserById(id: string): Promise<{
        ordersCount: number;
        wishlistCount: number;
        status: import("@prisma/client").$Enums.UserStatus;
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        addresses: {
            id: string;
            userId: string;
            label: string;
            city: string;
            street: string;
            building: string;
            apartment: string | null;
            postalCode: string;
            isDefault: boolean;
        }[];
        _count: {
            orders: number;
            wishlistItems: number;
        };
    }>;
    updateRole(id: string, role: UserRole, currentUserId: string): Promise<{
        status: import("@prisma/client").$Enums.UserStatus;
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
    updateStatus(id: string, status: UserStatus, currentUserId: string): Promise<{
        status: import("@prisma/client").$Enums.UserStatus;
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
    deleteUser(id: string, currentUserId: string): Promise<void>;
}
export declare const adminUserService: AdminUserService;
export {};
//# sourceMappingURL=user.service.d.ts.map