import dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config();
const envSchema = z.object({
    PORT: z.string().default('5000'),
    MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
    JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    CLIENT_URL: z.string().default('http://localhost:5173'),
});
const envParsed = envSchema.safeParse(process.env);
if (!envParsed.success) {
    console.error('❌ Invalid environment variables:', envParsed.error.format());
    process.exit(1);
}
export const env = envParsed.data;
//# sourceMappingURL=env.js.map