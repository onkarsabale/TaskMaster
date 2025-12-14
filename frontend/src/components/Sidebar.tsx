import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

export const Sidebar = () => {
    const { user } = useAuthStore();

    return (
        <aside className="hidden lg:flex flex-col w-64 border-r border-gray-200 dark:border-gray-800 bg-[rgb(var(--color-bg))] shrink-0 transition-all duration-300">
            <div className="p-4 flex flex-col h-full justify-between">
                <div className="flex flex-col gap-6">
                    {/* Branding */}
                    <div className="flex items-center gap-3 px-2">
                        <div className="bg-[rgb(var(--color-primary))]/10 flex items-center justify-center rounded-lg size-10 text-[rgb(var(--color-primary))]">
                            <span className="material-symbols-outlined">task_alt</span>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-base font-bold leading-none text-[rgb(var(--color-text))]">TaskMaster</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-normal">Personal Workspace</p>
                        </div>
                    </div>
                    {/* Navigation */}
                    <nav className="flex flex-col gap-1">
                        <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] group transition-colors">
                            <span className="material-symbols-outlined fill-1">dashboard</span>
                            <span className="text-sm font-medium">Dashboard</span>
                        </Link>
                        <Link to="/projects" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[rgb(var(--color-text))] transition-colors">
                            <span className="material-symbols-outlined">folder_open</span>
                            <span className="text-sm font-medium">Projects</span>
                        </Link>
                        <Link to="/tasks" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[rgb(var(--color-text))] transition-colors">
                            <span className="material-symbols-outlined">check_circle</span>
                            <span className="text-sm font-medium">My Tasks</span>
                        </Link>
                        <Link to="/team" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[rgb(var(--color-text))] transition-colors">
                            <span className="material-symbols-outlined">groups</span>
                            <span className="text-sm font-medium">Team</span>
                        </Link>
                    </nav>
                </div>
                {/* Bottom Actions */}
                <div className="flex flex-col gap-1">
                    <Link to="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[rgb(var(--color-text))] transition-colors">
                        <span className="material-symbols-outlined">settings</span>
                        <span className="text-sm font-medium">Settings</span>
                    </Link>
                    <Link to="/support" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[rgb(var(--color-text))] transition-colors">
                        <span className="material-symbols-outlined">help</span>
                        <span className="text-sm font-medium">Support</span>
                    </Link>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center gap-3 px-2">
                        {/* Placeholder Avatar - could use user's image if available */}
                        <div className="bg-center bg-no-repeat bg-cover rounded-full size-8 ring-2 ring-[rgb(var(--color-primary))]/20 bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <p className="text-sm font-medium truncate text-[rgb(var(--color-text))]">{user?.username || 'User'}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};
