export interface ProjectMember {
    user: {
        _id: string;
        username: string;
        email: string;
    };
    role: 'project_manager' | 'project_member';
}

export interface Project {
    _id: string;
    title: string;
    description?: string;
    owner: {
        _id: string;
        username: string;
        email: string;
    };
    members: ProjectMember[];
    createdAt: string;
    updatedAt: string;
}

export type ProjectRole = 'project_manager' | 'project_member';
