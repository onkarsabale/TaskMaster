import type { Response } from 'express';
import type { RegisterDto, LoginDto } from './auth.dto.js';
export declare const register: (res: Response, data: RegisterDto) => Promise<{
    _id: import("mongoose").Types.ObjectId;
    username: string;
    email: string;
    role: "user" | "manager" | "admin";
    token: string;
}>;
export declare const login: (res: Response, data: LoginDto) => Promise<{
    _id: import("mongoose").Types.ObjectId;
    username: string;
    email: string;
    role: "user" | "manager" | "admin";
    token: string;
}>;
export declare const logout: (res: Response) => {
    message: string;
};
//# sourceMappingURL=auth.service.d.ts.map