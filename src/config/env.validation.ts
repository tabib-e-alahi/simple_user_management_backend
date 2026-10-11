import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters long'),
  // In seconds. 900 = 15 minutes
  JWT_ACCESS_EXPIRES_IN: z.coerce.number().int().positive().default(900),
});

export type Env = z.infer<typeof envSchema>;

// Called by ConfigModule at startup. If anything is missing or wrong, the app refuses to start.
export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
