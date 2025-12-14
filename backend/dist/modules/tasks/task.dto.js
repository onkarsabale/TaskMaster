import { z } from 'zod';
export const createTaskSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    projectId: z.string().min(1, 'Project ID is required'),
    description: z.string().optional(),
    status: z.enum(['pending', 'in-progress', 'completed']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    dueDate: z.string().transform((str) => new Date(str)).optional(),
    assignedTo: z.string().optional(), // User ID
});
export const updateTaskSchema = createTaskSchema.partial();
//# sourceMappingURL=task.dto.js.map