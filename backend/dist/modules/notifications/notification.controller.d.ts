import type { Request, Response, NextFunction } from 'express';
export declare const getNotifications: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const markRead: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const clearNotifications: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const respondToInvite: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=notification.controller.d.ts.map