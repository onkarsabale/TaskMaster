import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('5000'),
    MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
    JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    CLIENT_URL: z.string().url('CLIENT_URL must be a valid URL').optional(),
});

const envParsed = envSchema.safeParse(process.env);

if (!envParsed.success) {
    console.error('❌ Invalid environment variables:', envParsed.error.format());
    process.exit(1);
}

const parsedEnv = envParsed.data;

if (parsedEnv.NODE_ENV === 'production' && !parsedEnv.CLIENT_URL) {
    console.error('❌ CLIENT_URL is required in production');
    process.exit(1);
}

export const env = {
    ...parsedEnv,
    CLIENT_URL: parsedEnv.CLIENT_URL ?? 'http://localhost:5173',
};
