import type { Request, Response, NextFunction } from 'express';
export declare const checkProjectPermission: (requiredRole?: "project_manager" | "project_member") => (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=permission.middleware.d.ts.map