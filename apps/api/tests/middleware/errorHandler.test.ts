import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { AppError, errorHandler } from '../../src/middleware/errorHandler';

describe('Error Handler Middleware', () => {
  const mockRequest = {} as Request;
  const mockNext = vi.fn() as NextFunction;

  const createMockResponse = () => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnThis();
    res.json = vi.fn().mockReturnThis();
    return res;
  };

  describe('AppError class', () => {
    it('should create error with message and statusCode', () => {
      const error = new AppError('Test error', 400);

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });

    it('should default isOperational to true', () => {
      const error = new AppError('Test', 500);
      expect(error.isOperational).toBe(true);
    });

    it('should allow setting isOperational to false', () => {
      const error = new AppError('Test', 500, false);
      expect(error.isOperational).toBe(false);
    });

    it('should be instanceof Error', () => {
      const error = new AppError('Test', 400);
      expect(error).toBeInstanceOf(Error);
    });

    it('should capture stack trace', () => {
      const error = new AppError('Test', 400);
      expect(error.stack).toBeDefined();
    });
  });

  describe('errorHandler middleware', () => {
    it('should handle AppError with correct status', () => {
      const res = createMockResponse();
      const error = new AppError('Not found', 404);

      errorHandler(error, mockRequest, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Not found',
        })
      );
    });

    it('should handle AppError 400 bad request', () => {
      const res = createMockResponse();
      const error = new AppError('Invalid input', 400);

      errorHandler(error, mockRequest, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle AppError 401 unauthorized', () => {
      const res = createMockResponse();
      const error = new AppError('Unauthorized', 401);

      errorHandler(error, mockRequest, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should handle AppError 403 forbidden', () => {
      const res = createMockResponse();
      const error = new AppError('Forbidden', 403);

      errorHandler(error, mockRequest, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should handle generic Error as 500', () => {
      const res = createMockResponse();
      const error = new Error('Generic error');

      errorHandler(error, mockRequest, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should not expose error details in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const res = createMockResponse();
      const error = new Error('Internal details');

      errorHandler(error, mockRequest, res, mockNext);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.any(String),
        })
      );

      process.env.NODE_ENV = originalEnv;
    });
  });
});
