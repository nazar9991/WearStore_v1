import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  passwordSchema,
  phoneSchema,
  registerSchema,
  loginSchema,
  updateProfileSchema,
  addressSchema,
  createOrderSchema,
  productFilterSchema,
} from '../../../../packages/shared/src/validators';

describe('Validation Schemas', () => {
  describe('emailSchema', () => {
    it('should accept valid email', () => {
      expect(emailSchema.safeParse('test@example.com').success).toBe(true);
      expect(emailSchema.safeParse('user.name@domain.co.uk').success).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(emailSchema.safeParse('invalid').success).toBe(false);
      expect(emailSchema.safeParse('test@').success).toBe(false);
      expect(emailSchema.safeParse('@domain.com').success).toBe(false);
    });
  });

  describe('passwordSchema', () => {
    it('should accept valid password', () => {
      expect(passwordSchema.safeParse('password123').success).toBe(true);
      expect(passwordSchema.safeParse('12345678').success).toBe(true);
    });

    it('should reject short password', () => {
      expect(passwordSchema.safeParse('1234567').success).toBe(false);
      expect(passwordSchema.safeParse('').success).toBe(false);
    });
  });

  describe('phoneSchema', () => {
    it('should accept valid phone numbers', () => {
      expect(phoneSchema.safeParse('+380501234567').success).toBe(true);
      expect(phoneSchema.safeParse('0501234567').success).toBe(true);
      expect(phoneSchema.safeParse(undefined).success).toBe(true); // optional
    });

    it('should reject invalid phone numbers', () => {
      expect(phoneSchema.safeParse('123').success).toBe(false);
      expect(phoneSchema.safeParse('phone').success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should accept valid registration data', () => {
      expect(registerSchema.safeParse(validData).success).toBe(true);
    });

    it('should accept with optional phone', () => {
      expect(registerSchema.safeParse({ ...validData, phone: '+380501234567' }).success).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(registerSchema.safeParse({ ...validData, email: 'invalid' }).success).toBe(false);
    });

    it('should reject short password', () => {
      expect(registerSchema.safeParse({ ...validData, password: '123' }).success).toBe(false);
    });

    it('should reject short first name', () => {
      expect(registerSchema.safeParse({ ...validData, firstName: 'J' }).success).toBe(false);
    });

    it('should reject short last name', () => {
      expect(registerSchema.safeParse({ ...validData, lastName: 'D' }).success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should accept valid login data', () => {
      expect(loginSchema.safeParse({ email: 'test@test.com', password: 'pass' }).success).toBe(true);
    });

    it('should reject empty password', () => {
      expect(loginSchema.safeParse({ email: 'test@test.com', password: '' }).success).toBe(false);
    });
  });

  describe('updateProfileSchema', () => {
    it('should accept partial updates', () => {
      expect(updateProfileSchema.safeParse({ firstName: 'John' }).success).toBe(true);
      expect(updateProfileSchema.safeParse({ lastName: 'Doe' }).success).toBe(true);
      expect(updateProfileSchema.safeParse({}).success).toBe(true);
    });

    it('should reject short names', () => {
      expect(updateProfileSchema.safeParse({ firstName: 'J' }).success).toBe(false);
    });
  });

  describe('addressSchema', () => {
    const validAddress = {
      label: 'Home',
      city: 'Kyiv',
      street: 'Main Street',
      building: '10',
      postalCode: '01001',
    };

    it('should accept valid address', () => {
      expect(addressSchema.safeParse(validAddress).success).toBe(true);
    });

    it('should accept with optional apartment', () => {
      expect(addressSchema.safeParse({ ...validAddress, apartment: '5A' }).success).toBe(true);
    });

    it('should accept with optional isDefault', () => {
      expect(addressSchema.safeParse({ ...validAddress, isDefault: true }).success).toBe(true);
    });

    it('should reject missing required fields', () => {
      expect(addressSchema.safeParse({ label: 'Home' }).success).toBe(false);
    });
  });

  describe('createOrderSchema', () => {
    const validOrder = {
      deliveryMethod: 'NOVA_POSHTA_WAREHOUSE',
      paymentMethod: 'LIQPAY',
    };

    it('should accept valid order', () => {
      expect(createOrderSchema.safeParse(validOrder).success).toBe(true);
    });

    it('should accept all delivery methods', () => {
      expect(createOrderSchema.safeParse({ ...validOrder, deliveryMethod: 'NOVA_POSHTA_COURIER' }).success).toBe(true);
      expect(createOrderSchema.safeParse({ ...validOrder, deliveryMethod: 'UKRPOSHTA' }).success).toBe(true);
    });

    it('should accept all payment methods', () => {
      expect(createOrderSchema.safeParse({ ...validOrder, paymentMethod: 'CASH_ON_DELIVERY' }).success).toBe(true);
    });

    it('should reject invalid delivery method', () => {
      expect(createOrderSchema.safeParse({ ...validOrder, deliveryMethod: 'INVALID' }).success).toBe(false);
    });

    it('should reject invalid payment method', () => {
      expect(createOrderSchema.safeParse({ ...validOrder, paymentMethod: 'INVALID' }).success).toBe(false);
    });

    it('should accept optional promo code', () => {
      expect(createOrderSchema.safeParse({ ...validOrder, promoCode: 'SALE20' }).success).toBe(true);
    });

    it('should reject too long customer note', () => {
      const longNote = 'a'.repeat(501);
      expect(createOrderSchema.safeParse({ ...validOrder, customerNote: longNote }).success).toBe(false);
    });
  });

  describe('productFilterSchema', () => {
    it('should accept empty filters', () => {
      expect(productFilterSchema.safeParse({}).success).toBe(true);
    });

    it('should accept valid filters', () => {
      const filters = {
        category: 'dresses',
        minPrice: 100,
        maxPrice: 1000,
        inStock: true,
        onSale: false,
        sort: 'price_asc',
        page: 1,
        limit: 12,
      };
      expect(productFilterSchema.safeParse(filters).success).toBe(true);
    });

    it('should coerce string numbers', () => {
      const result = productFilterSchema.safeParse({ page: '2', limit: '24' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(24);
      }
    });

    it('should reject invalid sort', () => {
      expect(productFilterSchema.safeParse({ sort: 'invalid' }).success).toBe(false);
    });

    it('should accept valid sort values', () => {
      expect(productFilterSchema.safeParse({ sort: 'price_asc' }).success).toBe(true);
      expect(productFilterSchema.safeParse({ sort: 'price_desc' }).success).toBe(true);
      expect(productFilterSchema.safeParse({ sort: 'newest' }).success).toBe(true);
      expect(productFilterSchema.safeParse({ sort: 'popular' }).success).toBe(true);
    });

    it('should reject limit over max', () => {
      expect(productFilterSchema.safeParse({ limit: 100 }).success).toBe(false);
    });

    it('should reject non-positive page', () => {
      expect(productFilterSchema.safeParse({ page: 0 }).success).toBe(false);
      expect(productFilterSchema.safeParse({ page: -1 }).success).toBe(false);
    });
  });
});
