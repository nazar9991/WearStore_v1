import { Prisma, DeliveryMethod, PaymentMethod } from '@prisma/client';
interface CreateOrderInput {
    addressId?: string;
    deliveryMethod: DeliveryMethod;
    paymentMethod: PaymentMethod;
    promoCode?: string;
    customerNote?: string;
}
export declare class OrderService {
    createOrder(userId: string, input: CreateOrderInput): Promise<{
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
    }>;
    getUserOrders(userId: string, page?: number, limit?: number): Promise<{
        data: ({
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
    getOrderById(userId: string, orderId: string): Promise<{
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
    cancelOrder(userId: string, orderId: string): Promise<{
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
    private calculateShippingCost;
}
export declare const orderService: OrderService;
export {};
//# sourceMappingURL=order.service.d.ts.map