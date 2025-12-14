import { useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import type { Project } from '../types/project';
import { Loader } from './Loader';

export const ProjectList = () => {
    // This hook fetches /projects which returns ALL projects for admin
    const { data: projects = [], isLoading } = useProjects();
    const navigate = useNavigate();

    if (isLoading) return <Loader />;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: Project) => (
                <div
                    key={project._id}
                    onClick={() => navigate(`/projects/${project._id}`)}
                    className="bg-white dark:bg-[#1e2736] p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer group"
                >
                    <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-lg text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">{project.title}</h4>
                        <span className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-600">
                            Owner: {project.owner?.username}
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 min-h-[40px]">{project.description || 'No description provided.'}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                            <span className="material-symbols-outlined text-[16px] mr-1">group</span>
                            {project.members?.length || 0} members
                        </div>
                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                            <span className="material-symbols-outlined text-[16px] mr-1">calendar_today</span>
                            {new Date(project.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
