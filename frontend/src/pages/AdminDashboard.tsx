import { useState } from 'react';
import { UserManagement } from '../components/admin/UserManagement';
import { ProjectList } from '../components/ProjectList';
// Reuse task list for global view? Or create ProjectList?
// Actually Admin wants to see "all the project managers, users and their projects and tasks of that project"
// So maybe a "All Projects" tab which lists all projects, and clicking one goes to project details (which we already have).
// Since we updated project controller to return ALL projects for admin, simply reusing a Project List component is best.


export const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'projects'>('users');

    return (
        <div className="flex flex-col h-full bg-[#f6f7f8] dark:bg-[#101822]">
            <header className="h-16 shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111418] flex items-center justify-between px-6 lg:px-8">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold">Admin Dashboard</h2>
                    <div className="flex bg-gray-100 dark:bg-[#1f2937] p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'users'
                                ? 'bg-white dark:bg-gray-800 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                        >
                            User Management
                        </button>
                        <button
                            onClick={() => setActiveTab('projects')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'projects'
                                ? 'bg-white dark:bg-gray-800 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                        >
                            All Projects
                        </button>
                    </div>
                </div>
                <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="text-sm font-medium text-slate-500 hover:text-primary transition-colors"
                >
                    Back to Dashboard
                </button>
            </header>

            <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {activeTab === 'users' ? <UserManagement /> : <ProjectList />}
                </div>
            </main>
        </div>
    );
};
