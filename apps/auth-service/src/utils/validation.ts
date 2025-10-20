import { z } from 'zod';

/**
 * Validation schemas for authentication endpoints
 *
 * Security features:
 * - Email format validation
 * - Strong password requirements (min 8 chars, uppercase, lowercase, number)
 * - Input sanitization through Zod
 */

/**
 * User registration schema
 */
export const registerSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required')
    .max(255, 'Email is too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name is too long')
    .optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * User login schema
 */
export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  password: z.string()
    .min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Refresh token schema
 */
export const refreshTokenSchema = z.object({
  refresh_token: z.string()
    .min(1, 'Refresh token is required'),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
