import { useState } from 'react';
import { useProjects, useCreateProject } from '../hooks/useProjects';
import { Loader } from '../components/Loader';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

import { useSidebar } from '../context/SidebarContext';

export const Projects = () => {
    const { toggle } = useSidebar();
    const { data: projects, isLoading } = useProjects();
    const { user } = useAuthStore();
    const { mutate: createProject } = useCreateProject();
    const navigate = useNavigate();
    const [isCreating, setIsCreating] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createProject({ title, description }, {
            onSuccess: () => {
                setIsCreating(false);
                setTitle('');
                setDescription('');
            }
        });
    };

    if (isLoading) return <Loader />;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggle}
                        className="lg:hidden text-[#637588] dark:text-[#9da8b9]"
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Projects</h1>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    New Project
                </button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreate} className="mb-8 bg-white dark:bg-[#1e2736] p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-[#111418] dark:border-gray-600 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-[#111418] dark:border-gray-600 dark:text-white"
                                rows={3}
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-gray-700 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
                            >
                                Create Project
                            </button>
                        </div>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects?.map((project) => {
                    const myMember = project.members.find((m: import('../types/project').ProjectMember) => m.user._id === user?._id);

                    return (
                        <div
                            key={project._id}
                            onClick={() => navigate(`/projects/${project._id}`)}
                            className="bg-white dark:bg-[#1e2736] p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer flex flex-col gap-4 group"
                        >
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{project.title}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${project.owner._id === user?._id
                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                    : myMember?.role === 'project_manager'
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                        : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                    }`}>
                                    {project.owner._id === user?._id ? 'Owner' : (myMember?.role?.replace('_', ' ') || 'Member')}
                                </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 line-clamp-2">{project.description || 'No description'}</p>

                            <div className="mt-auto border-t border-gray-100 dark:border-gray-700 pt-4 flex items-center justify-between text-sm text-slate-500">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">group</span>
                                    <span>{project.members.length} members</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">task</span>
                                    <span>{(project as unknown as { taskCount: number }).taskCount || 0} tasks</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
