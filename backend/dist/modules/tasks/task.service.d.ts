import type { IUser } from '../users/user.model.js';
import type { CreateTaskDto, UpdateTaskDto } from './task.dto.js';
export declare const createTask: (data: CreateTaskDto, user: IUser) => Promise<import("./task.model.js").ITask | null>;
export declare const getTasks: (user: IUser, filter?: any) => Promise<import("./task.model.js").ITask[]>;
export declare const getTaskById: (id: string, user: IUser) => Promise<import("./task.model.js").ITask>;
export declare const updateTask: (id: string, data: UpdateTaskDto, user: IUser) => Promise<import("./task.model.js").ITask>;
export declare const deleteTask: (id: string, user: IUser) => Promise<{
    message: string;
}>;
//# sourceMappingURL=task.service.d.ts.map