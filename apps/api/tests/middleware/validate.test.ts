import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { validate } from '../../src/middleware/validate';

console.log('Starting tests...');

describe('Validate Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
      params: {},
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
  });

  describe('body validation', () => {
    const bodySchema = z.object({
      email: z.string().email(),
      name: z.string().min(2),
    });

    it('should pass valid body data', async () => {
      mockRequest.body = { email: 'test@test.com', name: 'John' };

      const middleware = validate({ body: bodySchema });
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should reject invalid email', async () => {
      mockRequest.body = { email: 'invalid', name: 'John' };

      const middleware = validate({ body: bodySchema });
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ZodError));
    });

    it('should reject short name', async () => {
      mockRequest.body = { email: 'test@test.com', name: 'J' };

      const middleware = validate({ body: bodySchema });
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ZodError));
    });

    it('should reject missing required fields', async () => {
      mockRequest.body = { email: 'test@test.com' };

      const middleware = validate({ body: bodySchema });
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ZodError));
    });

    it('should transform parsed body', async () => {
      mockRequest.body = { email: 'TEST@TEST.COM', name: 'John' };

      const middleware = validate({ body: bodySchema });
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body.email).toBe('TEST@TEST.COM');
    });
  });

  describe('query validation', () => {
    const querySchema = z.object({
      page: z.coerce.number().positive(),
      limit: z.coerce.number().positive().max(100),
    });

    it('should pass valid query params', async () => {
      mockRequest.query = { page: '1', limit: '10' };

      const middleware = validate({ query: querySchema });
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should coerce string to number', async () => {
      mockRequest.query = { page: '5', limit: '20' };

      const middleware = validate({ query: querySchema });
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.query).toEqual({ page: 5, limit: 20 });
    });

    it('should reject invalid page', async () => {
      mockRequest.query = { page: '0', limit: '10' };

      const middleware = validate({ query: querySchema });
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ZodError));
    });

    it('should reject limit over max', async () => {
      mockRequest.query = { page: '1', limit: '200' };

      const middleware = validate({ query: querySchema });
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ZodError));
    });
  });

  describe('params validation', () => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    it('should pass valid UUID param', async () => {
      mockRequest.params = { id: '550e8400-e29b-41d4-a716-446655440000' };

      const middleware = validate({ params: paramsSchema });
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should reject invalid UUID', async () => {
      mockRequest.params = { id: 'invalid-uuid' };

      const middleware = validate({ params: paramsSchema });
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ZodError));
    });
  });

  describe('nested objects', () => {
    const nestedSchema = z.object({
      user: z.object({
        name: z.string(),
        address: z.object({
          city: z.string(),
        }),
      }),
    });

    it('should validate nested objects', async () => {
      mockRequest.body = {
        user: {
          name: 'John',
          address: { city: 'Kyiv' },
        },
      };

      const middleware = validate({ body: nestedSchema });
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should reject invalid nested data', async () => {
      mockRequest.body = {
        user: {
          name: 'John',
          address: {},
        },
      };

      const middleware = validate({ body: nestedSchema });
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ZodError));
    });
  });

  describe('optional fields', () => {
    const optionalSchema = z.object({
      required: z.string(),
      optional: z.string().optional(),
    });

    it('should pass without optional field', async () => {
      mockRequest.body = { required: 'value' };

      const middleware = validate({ body: optionalSchema });
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should pass with optional field', async () => {
      mockRequest.body = { required: 'value', optional: 'extra' };

      const middleware = validate({ body: optionalSchema });
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('combined validation', () => {
    it('should validate body, query, and params together', async () => {
      mockRequest.body = { name: 'John' };
      mockRequest.query = { page: '1' };
      mockRequest.params = { id: '550e8400-e29b-41d4-a716-446655440000' };

      const middleware = validate({
        body: z.object({ name: z.string() }),
        query: z.object({ page: z.coerce.number() }),
        params: z.object({ id: z.string().uuid() }),
      });
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});

console.log('Tests completed.');
