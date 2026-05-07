interface UpdateProfileInput {
    firstName?: string;
    lastName?: string;
    phone?: string;
}
interface ChangePasswordInput {
    currentPassword: string;
    newPassword: string;
}
interface AddressInput {
    label: string;
    city: string;
    street: string;
    building: string;
    apartment?: string;
    postalCode: string;
    isDefault?: boolean;
}
export declare class ProfileService {
    getProfile(userId: string): Promise<{
        ordersCount: number;
        wishlistCount: number;
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        avatarUrl: string | null;
        createdAt: Date;
        _count: {
            orders: number;
            wishlistItems: number;
        };
    }>;
    updateProfile(userId: string, input: UpdateProfileInput): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        avatarUrl: string | null;
    }>;
    changePassword(userId: string, input: ChangePasswordInput): Promise<void>;
    getAddresses(userId: string): Promise<{
        id: string;
        userId: string;
        label: string;
        city: string;
        street: string;
        building: string;
        apartment: string | null;
        postalCode: string;
        isDefault: boolean;
    }[]>;
    addAddress(userId: string, input: AddressInput): Promise<{
        id: string;
        userId: string;
        label: string;
        city: string;
        street: string;
        building: string;
        apartment: string | null;
        postalCode: string;
        isDefault: boolean;
    }>;
    updateAddress(userId: string, addressId: string, input: AddressInput): Promise<{
        id: string;
        userId: string;
        label: string;
        city: string;
        street: string;
        building: string;
        apartment: string | null;
        postalCode: string;
        isDefault: boolean;
    }>;
    deleteAddress(userId: string, addressId: string): Promise<void>;
}
export declare const profileService: ProfileService;
export {};
//# sourceMappingURL=profile.service.d.ts.map