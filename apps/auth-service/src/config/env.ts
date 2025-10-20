import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
config();

/**
 * Environment variable validation schema
 * Ensures all required configuration is present and valid at startup
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('3001'),
  HOST: z.string().default('0.0.0.0'),

  // Supabase configuration
  SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_KEY: z.string().min(1, 'Supabase service key is required'),

  // JWT configuration - minimum 32 characters for security
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),

  // CORS configuration - parse comma-separated origins
  CORS_ORIGIN: z.string().transform((val) => val.split(',').map(origin => origin.trim())),

  // Rate limiting
  RATE_LIMIT_MAX: z.string().transform(Number).pipe(z.number().positive()).default('100'),
  RATE_LIMIT_TIMEWINDOW: z.string().transform(Number).pipe(z.number().positive()).default('900000'),

  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

/**
 * Parse and validate environment variables
 * Throws an error if validation fails, preventing app startup with invalid config
 */
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue =>
        `${issue.path.join('.')}: ${issue.message}`
      ).join('\n');

      throw new Error(`Environment validation failed:\n${issues}`);
    }
    throw error;
  }
};

export const env = parseEnv();

export type Env = z.infer<typeof envSchema>;
