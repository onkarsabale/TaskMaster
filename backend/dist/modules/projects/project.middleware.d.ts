import type { Request, Response, NextFunction } from 'express';
type ProjectAction = 'view_project' | 'update_project' | 'add_member' | 'remove_member' | 'create_task' | 'assign_task' | 'update_task_status' | 'edit_task_details' | 'delete_task';
export declare const checkProjectPermission: (action: ProjectAction) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export {};
//# sourceMappingURL=project.middleware.d.ts.map