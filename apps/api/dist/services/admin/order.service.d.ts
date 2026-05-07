import { Prisma, OrderStatus } from '@prisma/client';
interface GetOrdersInput {
    status?: OrderStatus;
    paymentStatus?: string;
    search?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
}
export declare class AdminOrderService {
    getOrders(input: GetOrdersInput): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
            items: {
                id: string;
                quantity: number;
                productSnapshot: Prisma.JsonValue;
                unitPrice: Prisma.Decimal;
                totalPrice: Prisma.Decimal;
                orderId: string;
            }[];
        } & {
            status: import("@prisma/client").$Enums.OrderStatus;
            promoCode: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            orderNumber: string;
            subtotal: Prisma.Decimal;
            discountAmount: Prisma.Decimal;
            shippingCost: Prisma.Decimal;
            totalAmount: Prisma.Decimal;
            deliveryMethod: import("@prisma/client").$Enums.DeliveryMethod;
            addressId: string | null;
            addressSnapshot: Prisma.JsonValue;
            trackingNumber: string | null;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            liqpayOrderId: string | null;
            paidAt: Date | null;
            customerNote: string | null;
            managerNote: string | null;
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
    getOrderById(id: string): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
        };
        address: {
            id: string;
            userId: string;
            label: string;
            city: string;
            street: string;
            building: string;
            apartment: string | null;
            postalCode: string;
            isDefault: boolean;
        } | null;
        items: {
            id: string;
            quantity: number;
            productSnapshot: Prisma.JsonValue;
            unitPrice: Prisma.Decimal;
            totalPrice: Prisma.Decimal;
            orderId: string;
        }[];
        statusHistory: {
            id: string;
            createdAt: Date;
            fromStatus: import("@prisma/client").$Enums.OrderStatus | null;
            toStatus: import("@prisma/client").$Enums.OrderStatus;
            comment: string | null;
            managerId: string | null;
            orderId: string;
        }[];
    } & {
        status: import("@prisma/client").$Enums.OrderStatus;
        promoCode: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        orderNumber: string;
        subtotal: Prisma.Decimal;
        discountAmount: Prisma.Decimal;
        shippingCost: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        deliveryMethod: import("@prisma/client").$Enums.DeliveryMethod;
        addressId: string | null;
        addressSnapshot: Prisma.JsonValue;
        trackingNumber: string | null;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        liqpayOrderId: string | null;
        paidAt: Date | null;
        customerNote: string | null;
        managerNote: string | null;
    }>;
    updateStatus(orderId: string, newStatus: OrderStatus, managerId: string, comment?: string): Promise<{
        user: {
            email: string;
            firstName: string;
        };
        statusHistory: {
            id: string;
            createdAt: Date;
            fromStatus: import("@prisma/client").$Enums.OrderStatus | null;
            toStatus: import("@prisma/client").$Enums.OrderStatus;
            comment: string | null;
            managerId: string | null;
            orderId: string;
        }[];
    } & {
        status: import("@prisma/client").$Enums.OrderStatus;
        promoCode: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        orderNumber: string;
        subtotal: Prisma.Decimal;
        discountAmount: Prisma.Decimal;
        shippingCost: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        deliveryMethod: import("@prisma/client").$Enums.DeliveryMethod;
        addressId: string | null;
        addressSnapshot: Prisma.JsonValue;
        trackingNumber: string | null;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        liqpayOrderId: string | null;
        paidAt: Date | null;
        customerNote: string | null;
        managerNote: string | null;
    }>;
    addTrackingNumber(orderId: string, trackingNumber: string): Promise<{
        status: import("@prisma/client").$Enums.OrderStatus;
        promoCode: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        orderNumber: string;
        subtotal: Prisma.Decimal;
        discountAmount: Prisma.Decimal;
        shippingCost: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        deliveryMethod: import("@prisma/client").$Enums.DeliveryMethod;
        addressId: string | null;
        addressSnapshot: Prisma.JsonValue;
        trackingNumber: string | null;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        liqpayOrderId: string | null;
        paidAt: Date | null;
        customerNote: string | null;
        managerNote: string | null;
    }>;
    addManagerNote(orderId: string, note: string): Promise<{
        status: import("@prisma/client").$Enums.OrderStatus;
        promoCode: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        orderNumber: string;
        subtotal: Prisma.Decimal;
        discountAmount: Prisma.Decimal;
        shippingCost: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        deliveryMethod: import("@prisma/client").$Enums.DeliveryMethod;
        addressId: string | null;
        addressSnapshot: Prisma.JsonValue;
        trackingNumber: string | null;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        liqpayOrderId: string | null;
        paidAt: Date | null;
        customerNote: string | null;
        managerNote: string | null;
    }>;
}
export declare const adminOrderService: AdminOrderService;
export {};
//# sourceMappingURL=order.service.d.ts.map