import { useMemo } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useProjects } from '../hooks/useProjects';
import { UserManagement } from '../components/admin/UserManagement';
import { Loader } from '../components/Loader';

// Helper to extract unique members from projects
const useTeamMembers = () => {
    const { data: projects = [], isLoading } = useProjects();

    const members = useMemo(() => {
        const uniqueMembers = new Map();

        projects.forEach((project: import('../types/project').Project) => {
            // Add owner
            if (project.owner) {
                if (!uniqueMembers.has(project.owner._id)) {
                    uniqueMembers.set(project.owner._id, { ...project.owner, roles: ['Owner'] });
                }
            }

            // Add members
            project.members.forEach((member: import('../types/project').ProjectMember) => {
                if (!uniqueMembers.has(member.user._id)) {
                    uniqueMembers.set(member.user._id, { ...member.user, roles: [member.role] });
                } else {
                    // Merge roles if needed, or just keep first found
                    // distinctive roles display might be complex if they have different roles in different projects
                    // For simplicity, just listing them.
                }
            });
        });

        // Convert to array
        return Array.from(uniqueMembers.values());
    }, [projects]);

    return { members, isLoading };
};

export const Team = () => {
    const { user } = useAuthStore();
    const { members, isLoading } = useTeamMembers();

    // If Admin, show full User Management
    if (user?.role === 'admin') {
        return (
            <div className="flex-1 flex flex-col h-full bg-[rgb(var(--color-bg))] overflow-hidden">
                <header className="shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111418] px-6 py-4">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Team Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage all users in the system</p>
                </header>
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-6xl mx-auto">
                        <UserManagement />
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) return <Loader />;

    return (
        <div className="flex-1 flex flex-col h-full bg-[rgb(var(--color-bg))] overflow-hidden">
            <header className="shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111418] px-6 py-4">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Team</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">People you share projects with</p>
            </header>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {members.map((member: import('../types/user').User) => (
                        <div key={member._id} className="bg-white dark:bg-[#1e2736] rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-2xl mb-4 overflow-hidden">
                                {member.avatar ? (
                                    <img src={member.avatar} alt={member.username} className="w-full h-full object-cover" />
                                ) : (
                                    member.username.charAt(0).toUpperCase()
                                )}
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">{member.username}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">{member.email}</p>
                            <div className="mt-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${member.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                    member.role === 'manager' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                    }`}>
                                    {member.role}
                                </span>
                            </div>
                        </div>
                    ))}

                    {members.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <p className="text-slate-500">You haven't joined any projects with other members yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
