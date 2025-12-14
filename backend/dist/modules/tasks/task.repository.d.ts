import type { ITask } from './task.model.js';
import type { CreateTaskDto, UpdateTaskDto } from './task.dto.js';
export declare const createTask: (data: CreateTaskDto, userId: string) => Promise<ITask>;
export declare const findTasks: (filter: any) => Promise<ITask[]>;
export declare const findTaskById: (id: string) => Promise<ITask | null>;
export declare const updateTask: (id: string, data: UpdateTaskDto) => Promise<ITask | null>;
export declare const deleteTask: (id: string) => Promise<ITask | null>;
//# sourceMappingURL=task.repository.d.ts.map