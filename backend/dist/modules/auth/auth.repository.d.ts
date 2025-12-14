import type { IUser } from '../users/user.model.js';
export declare const findUserByEmail: (email: string) => Promise<IUser | null>;
export declare const createUser: (username: string, email: string, passwordHash: string) => Promise<IUser>;
export declare const findUserById: (id: string) => Promise<IUser | null>;
//# sourceMappingURL=auth.repository.d.ts.map