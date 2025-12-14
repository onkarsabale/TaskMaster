import { z } from 'zod';
export const updateProfileSchema = z.object({
    username: z.string().min(3).max(30).optional(),
    avatar: z.string().url().optional().or(z.literal('')),
});
export const createUserSchema = z.object({
    username: z.string().min(3).max(30),
    email: z.string().email(),
    password: z.string().min(6), // Password will be hashed by service/controller
    role: z.enum(['user', 'manager', 'admin']).default('user'),
    avatar: z.string().url().optional().or(z.literal('')),
});
export const updateUserSchema = z.object({
    username: z.string().min(3).max(30).optional(),
    email: z.string().email().optional(),
    role: z.enum(['user', 'manager', 'admin']).optional(),
    avatar: z.string().url().optional().or(z.literal('')),
});
//# sourceMappingURL=user.dto.js.map