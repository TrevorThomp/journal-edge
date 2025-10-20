import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
config();

/**
 * Base environment variable schema that all services must have
 * Services can extend this schema with their own specific variables
 */
export const baseEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)),
  HOST: z.string().default('0.0.0.0'),

  // Supabase configuration
  SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_KEY: z.string().min(1, 'Supabase service key is required'),

  // CORS configuration - parse comma-separated origins
  CORS_ORIGIN: z.string().transform((val) => val.split(',').map(origin => origin.trim())),

  // Rate limiting
  RATE_LIMIT_MAX: z.string().transform(Number).pipe(z.number().positive()).default('100'),
  RATE_LIMIT_TIMEWINDOW: z.string().transform(Number).pipe(z.number().positive()).default('900000'),

  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export type BaseEnv = z.infer<typeof baseEnvSchema>;

/**
 * Helper function to parse and validate environment variables
 * Throws an error if validation fails, preventing app startup with invalid config
 */
export function parseEnv<T extends z.ZodType>(schema: T): z.infer<T> {
  try {
    return schema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue =>
        `${issue.path.join('.')}: ${issue.message}`
      ).join('\n');

      throw new Error(`Environment validation failed:\n${issues}`);
    }
    throw error;
  }
}
