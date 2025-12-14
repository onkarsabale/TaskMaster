import * as projectService from './project.service.js';
export const createProject = async (req, res) => {
    try {
        const { title, description } = req.body;
        // @ts-ignore - user is attached by auth middleware
        const userId = req.user._id;
        const project = await projectService.createProject(title, description, userId);
        res.status(201).json(project);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating project', error });
    }
};
export const getMyProjects = async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user._id;
        const projects = await projectService.getUserProjects(userId);
        res.json(projects);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching projects', error });
    }
};
export const getProject = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id)
            return res.status(400).json({ message: 'Project ID is required' });
        const project = await projectService.getProjectById(id);
        if (!project)
            return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching project', error });
    }
};
export const addMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, role } = req.body;
        if (!id)
            return res.status(400).json({ message: 'Project ID is required' });
        const project = await projectService.addMember(id, userId, role);
        res.json(project);
    }
    catch (error) {
        res.status(500).json({ message: 'Error adding member', error });
    }
};
//# sourceMappingURL=project.controller.js.map