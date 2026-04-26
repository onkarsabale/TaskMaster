import type { IProject } from './project.model.js';
export declare const createProject: (title: string, description: string, userId: string) => Promise<IProject>;
export declare const getProjectById: (projectId: string) => Promise<IProject | null>;
export declare const getUserProjects: (userId: string) => Promise<IProject[]>;
export declare const addMember: (projectId: string, userId: string, role: "project_manager" | "project_member") => Promise<IProject | null>;
export declare const removeMember: (projectId: string, userId: string) => Promise<IProject | null>;
export declare const inviteUserToProject: (projectId: string, email: string, senderId: string) => Promise<{
    message: string;
}>;
export declare const deleteProject: (projectId: string, userId: string) => Promise<IProject | null>;
//# sourceMappingURL=project.service.d.ts.map