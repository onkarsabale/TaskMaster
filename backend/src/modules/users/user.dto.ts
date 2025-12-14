import { z } from 'zod';

export const updateProfileSchema = z.object({
    username: z.string().min(1, 'Username cannot be empty').optional(),
    avatar: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
