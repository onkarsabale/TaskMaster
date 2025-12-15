import type { IUser } from './user.model.js';
export declare const findUserById: (id: string) => Promise<IUser | null>;
export declare const findUsers: (query: string, field?: "all" | "email" | "username") => Promise<IUser[]>;
//# sourceMappingURL=user.repository.d.ts.map