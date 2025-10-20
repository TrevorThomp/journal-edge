import { baseEnvSchema, parseEnv } from '@journal-edge/fastify-framework';
import { z } from 'zod';

/**
 * Data service environment schema
 * Extends base schema with service-specific variables
 */
const dataServiceEnvSchema = baseEnvSchema.extend({
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('3002'),
});

export const env = parseEnv(dataServiceEnvSchema);

export type Env = z.infer<typeof dataServiceEnvSchema>;
