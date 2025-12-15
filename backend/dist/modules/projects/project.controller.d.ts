import type { Request, Response } from 'express';
export declare const createProject: (req: Request, res: Response) => Promise<void>;
export declare const getMyProjects: (req: Request, res: Response) => Promise<void>;
export declare const getProject: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const addMember: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const inviteMember: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=project.controller.d.ts.map