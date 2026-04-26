import type { IProject } from './project.model.js';
export declare const create: (data: Partial<IProject>) => Promise<IProject>;
export declare const findById: (id: string) => Promise<IProject | null>;
export declare const findByMember: (userId: string) => Promise<IProject[]>;
export declare const addMember: (projectId: string, userId: string, role: "project_manager" | "project_member") => Promise<IProject | null>;
export declare const removeMember: (projectId: string, userId: string) => Promise<IProject | null>;
export declare const isMember: (projectId: string, userId: string) => Promise<boolean>;
export declare const findByIdSimple: (id: string) => Promise<IProject | null>;
export declare const deleteById: (id: string) => Promise<IProject | null>;
//# sourceMappingURL=project.repository.d.ts.map