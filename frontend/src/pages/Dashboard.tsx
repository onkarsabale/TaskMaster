import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Task } from '../types';
import { TaskForm } from '../components/TaskForm';
import { Loader } from '../components/Loader';
// import { useSocket } from '../hooks/useSocket'; // Will be verified in step 7
import { useAuthStore } from '../store/auth.store';
import { DashboardStats } from '../components/DashboardStats';
import { TaskList } from '../components/TaskList';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import { PermissionGuard } from '../components/PermissionGuard';
import { useProjects } from '../hooks/useProjects';
import { ErrorState } from '../components/ErrorState';
import type { CreateTaskDto, UpdateTaskDto } from '../types/task';
import { ProfileModal } from '../components/ProfileModal';
import * as authApi from '../api/auth.api';
import { useToast } from '../hooks/useToast';
import type { Project } from '../types/project';
import { NotificationDropdown } from '../components/NotificationDropdown';
import { useConfirmDialog } from '../context/ConfirmDialogContext';
import { useSidebar } from '../context/useSidebar';

export const Dashboard = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    // React Query Hooks
    const { data: tasks = [], isLoading, error } = useTasks();
    const { data: projects = [] } = useProjects();
    const createTaskMutation = useCreateTask();
    const updateTaskMutation = useUpdateTask();
    const deleteTaskMutation = useDeleteTask();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

    // Filter states
    const [tab, setTab] = useState<'assigned' | 'created'>('assigned');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'newest'>('dueDate');
    const [searchQuery, setSearchQuery] = useState('');


    const [isProfileOpen, setIsProfileOpen] = useState(false);




    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const { user, login, logout } = useAuthStore();
    const { confirm } = useConfirmDialog();

    const { toggle } = useSidebar();

    const manageableProjects = useMemo(() => {
        if (!user || !projects) return [];
        // Admin gets all projects
        if (user.role === 'admin') return projects;

        return projects.filter(p => {
            const isOwner = p.owner._id === user._id || (typeof p.owner === 'string' && p.owner === user._id);
            const isManager = p.members?.some(m => m.user._id === user._id && m.role === 'project_manager');
            return isOwner || isManager;
        });
    }, [projects, user]);

    // Socket logic temporarily kept, but will be refactored to just invalidate queries
    // const socket = useSocket(); 

    // We don't need manual socket updates if we use invalidateQueries, 
    // but the requirement says "Socket updates should sync data, not replace REST calls"
    // For now, let's trust React Query's refetch on invalidation.
    // The socket integration step will handle the invalidation trigger.

    const handleCreateOrUpdate = async (data: CreateTaskDto | UpdateTaskDto, taskIdOrEvent?: string | unknown) => {
        try {
            // Check if second arg is a string ID (passed from TaskList)
            // If it's an event (from TaskForm match), ignore it.
            const explicitId = typeof taskIdOrEvent === 'string' ? taskIdOrEvent : undefined;
            const idToUpdate = explicitId || editingTask?._id;

            if (idToUpdate) {
                await updateTaskMutation.mutateAsync({ id: idToUpdate, data });
            } else {
                await createTaskMutation.mutateAsync(data as CreateTaskDto);
            }
            setIsModalOpen(false);
            setEditingTask(undefined);
        } catch (error: unknown) {
            console.error(error);
            alert('Failed to save task');
        }
    };

    const handleUpdateProfile = async (data: { username: string; avatar?: string }) => {
        try {
            const updatedUser = await authApi.updateProfile(data);
            login(updatedUser); // Update local store
        } catch (error) {
            console.error(error);
            alert('Failed to update profile');
            throw error;
        }
    };

    const handleLogout = async () => {
        try {
            await authApi.logout();
            logout(); // Clear store
        } catch (error) {
            console.error('Logout failed', error);
            logout();
        }
    };

    const handleDelete = async (id: string) => {
        // Permission check handled by backend and TaskList button visibility
        const confirmed = await confirm({
            title: 'Delete Task',
            message: 'Are you sure you want to delete this task? This action cannot be undone.',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            variant: 'danger',
        });
        if (confirmed) {
            await deleteTaskMutation.mutateAsync(id);
        }
    };




    // Derived Logic - Only count tasks assigned to the current user
    const stats = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        let open = 0, dueToday = 0, overdue = 0, completed = 0;

        tasks.forEach((task: Task) => {
            // Only count tasks assigned to the logged-in user
            const assignedId = typeof task.assignedTo === 'object' ? task.assignedTo?._id : task.assignedTo;
            if (assignedId !== user?._id) return;

            if (task.status === 'completed') {
                completed++;
            } else {
                open++;
                if (task.dueDate) {
                    const d = new Date(task.dueDate);
                    const t = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
                    if (t === today) dueToday++;
                    if (t < today) overdue++;
                }
            }
        });
        return { open, dueToday, overdue, completed };
    }, [tasks, user]);

    const filteredTasks = useMemo(() => {
        const result = tasks.filter((task: Task) => {
            // Tab filter
            if (tab === 'assigned') {
                const assignedId = typeof task.assignedTo === 'object' ? task.assignedTo?._id : task.assignedTo;
                if (assignedId !== user?._id) return false;
            } else {
                const createdId = typeof task.createdBy === 'object' ? task.createdBy?._id : task.createdBy;
                if (createdId !== user?._id) return false;
            }

            // Dropdown filters
            if (statusFilter !== 'all' && task.status !== statusFilter) return false;
            if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

            // Search Filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const titleMatch = task.title.toLowerCase().includes(query);
                const descMatch = task.description?.toLowerCase().includes(query);
                if (!titleMatch && !descMatch) return false;
            }

            return true;
        });

        // Sorting
        result.sort((a: Task, b: Task) => {
            if (sortBy === 'dueDate') {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            } else if (sortBy === 'priority') {
                const priorityWeight = { high: 3, medium: 2, low: 1 };
                return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
            } else if (sortBy === 'newest') {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            return 0;
        });

        return result;
    }, [tasks, tab, statusFilter, priorityFilter, searchQuery, sortBy, user]);

    // Critical Items (Overdue & High Priority)
    const criticalTasks = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        return tasks.filter((t: Task) => {
            if (t.status === 'completed') return false;
            if (t.dueDate) {
                const d = new Date(t.dueDate);
                return d.getTime() < today;
            }
            return false;
        }).slice(0, 3); // Take top 3
    }, [tasks]);

    if (isLoading) return <Loader />;

    if (error) {
        return (
            <div className="flex-1 overflow-hidden">
                <header className="h-16 shrink-0 border-b border-gray-200 dark:border-gray-800 bg-[rgb(var(--color-bg))] flex items-center justify-between px-6 lg:px-8">
                    <h2 className="text-lg font-bold">Dashboard</h2>
                </header>
                <ErrorState
                    message="Failed to load tasks"
                    description={error instanceof Error ? error.message : undefined}
                    onRetry={() => window.location.reload()}
                />
            </div>
        );
    }



    // ...

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            {/* Header */}
            <header className="h-16 shrink-0 border-b border-gray-200 dark:border-gray-800 bg-[rgb(var(--color-bg))] flex items-center justify-between px-6 lg:px-8 z-10">
                <button
                    onClick={toggle}
                    className="lg:hidden text-[#637588] dark:text-[#9da8b9]"
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>
                {/* Search Bar */}
                <div className="flex-1 max-w-xl mx-4 lg:mx-0">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-gray-400 group-focus-within:text-[rgb(var(--color-primary))] transition-colors">search</span>
                        </div>
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border-none rounded-lg leading-5 bg-[#f3f4f6] dark:bg-[#1f2937] text-[#111418] dark:text-white placeholder-[#9da8b9] focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm transition-all"
                            placeholder="Search tasks, projects, or tags..."
                            type="text"
                        />
                    </div>
                </div>
                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <NotificationDropdown />
                    <div className="relative">
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="relative size-9 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer"
                        >
                            {user?.avatar ? (
                                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                    {user?.username?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </button>

                        {/* Dropdown Menu */}
                        {isUserMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsUserMenuOpen(false)}
                                ></div>
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1e2736] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20 overflow-hidden">
                                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.username}</p>
                                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                        <div className="flex items-center gap-1 mt-1 bg-slate-100 dark:bg-slate-800 rounded px-1.5 py-0.5 max-w-fit">
                                            <span className="text-[10px] text-slate-400 font-mono">ID:</span>
                                            <span className="text-[10px] text-slate-600 dark:text-slate-300 font-mono truncate max-w-[120px]">{user?._id}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigator.clipboard.writeText(user?._id || '');
                                                    showToast('ID copied to clipboard', 'success');
                                                }}
                                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                                title="Copy ID"
                                            >
                                                <span className="material-symbols-outlined text-[12px]">content_copy</span>
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsUserMenuOpen(false);
                                            setIsProfileOpen(true);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-[#28303b] flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">person</span>
                                        Update Profile
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsUserMenuOpen(false);
                                            handleLogout();
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">logout</span>
                                        Logout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                    <button
                        onClick={() => window.location.href = '/projects'}
                        className="hidden sm:flex bg-white dark:bg-[#1e2736] border border-gray-200 dark:border-gray-700 text-slate-700 dark:text-slate-200 text-sm font-medium px-4 py-2 rounded-lg items-center gap-2 transition-colors hover:bg-gray-50 dark:hover:bg-[#28303b]"
                    >
                        <span className="material-symbols-outlined text-[20px]">folder</span>
                        <span>My Projects</span>
                    </button>
                    {user?.role === 'admin' && (
                        <button
                            onClick={() => window.location.href = '/admin'}
                            className="hidden sm:flex bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg items-center gap-2 transition-colors shadow-lg shadow-purple-500/20 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                            <span>Admin</span>
                        </button>
                    )}
                    <button
                        onClick={() => {
                            if (!manageableProjects || manageableProjects.length === 0) {
                                showToast('Please create a project first', 'error', 'You simply cannot add a task without a project.');
                                return;
                            }
                            setEditingTask(undefined);
                            setIsModalOpen(true);
                        }}
                        className="hidden sm:flex bg-[rgb(var(--color-primary))] hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg items-center gap-2 transition-colors shadow-lg shadow-blue-500/20 cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        <span>New Task</span>
                    </button>
                </div>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 scroll-smooth">
                <div className="max-w-[1200px] mx-auto flex flex-col gap-8">
                    {/* Welcome & Headline */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">Good morning, {user?.username}. You have <span className="text-[rgb(var(--color-primary))] font-medium">{stats.dueToday} tasks due today</span>.</p>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-[#1e2736] px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
                            <span className="font-medium text-slate-700 dark:text-slate-200">Today:</span> {new Date().toLocaleDateString()}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <DashboardStats
                        openTasks={stats.open}
                        dueToday={stats.dueToday}
                        overdue={stats.overdue}
                        completed={stats.completed}
                    />

                    {/* Projects Section */}
                    {projects && projects.length > 0 && (
                        <section className="flex flex-col gap-4">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Projects I belong to</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {projects.map((project: Project) => (
                                    <div
                                        key={project?._id || Math.random()}
                                        onClick={() => navigate(`/projects/${project?._id}`)}
                                        className="bg-white dark:bg-[#1e2736] rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-all cursor-pointer min-w-[280px] snap-center group"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-slate-800 dark:text-white truncate pr-2 group-hover:text-[rgb(var(--color-primary))] transition-colors">{project?.title || 'Untitled Project'}</h3>
                                            {project?.createdAt && (new Date().getTime() - new Date(project.createdAt).getTime() < 24 * 60 * 60 * 1000) && <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wide">NEW</span>}
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-gray-400 line-clamp-2 mb-3 h-10 leading-relaxed">{project?.description || 'No description available'}</p>
                                        <div className="flex items-center justify-between text-xs text-slate-400 dark:text-gray-500 pt-3 border-t border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-[16px]">group</span>
                                                <span>{project?.members?.length || 0} members</span>
                                            </div>
                                            <span>{project?.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                    </div>
                                ))}
                                <div
                                    onClick={() => window.location.href = '/projects'}
                                    className="bg-slate-50 dark:bg-[#111418] p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 hover:bg-slate-100 dark:hover:bg-[#1f2937] transition-colors cursor-pointer flex items-center justify-center text-slate-500 font-medium hover:text-slate-700 dark:hover:text-slate-300"
                                >
                                    View All Projects
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Overdue Section */}
                    {criticalTasks.length > 0 && (
                        <section className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="material-symbols-outlined text-red-500 filled">error</span>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Overdue Tasks</h3>
                            </div>
                            <div className="bg-[rgb(var(--color-bg))] rounded-xl border border-red-200 dark:border-red-900/30 overflow-hidden shadow-sm">
                                {criticalTasks.map((task: Task) => (
                                    <div key={task._id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border-b border-[#e5e7eb] dark:border-[#28303b] hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group last:border-0">
                                        <div className="mt-1 sm:mt-0">
                                            <div className="size-5 rounded-full border-2 border-[#9da8b9] group-hover:border-primary cursor-pointer"></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-sm font-semibold text-[#111418] dark:text-white truncate">{task.title}</h4>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'}`}>
                                                    {task.priority}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-[#637588] dark:text-[#9da8b9]">
                                                <span className="text-red-500 font-medium flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">event</span> Due {new Date(task.dueDate!).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                                            <button onClick={() => { setEditingTask(task); setIsModalOpen(true); }} className="ml-auto sm:ml-0 p-2 text-[#637588] dark:text-[#9da8b9] hover:text-[#111418] dark:hover:text-white bg-transparent hover:bg-[#f3f4f6] dark:hover:bg-[#28303b] rounded-lg">
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                            <PermissionGuard allowedRoles={['admin']}>
                                                <button onClick={() => handleDelete(task._id)} className="p-2 text-[#637588] dark:text-[#9da8b9] hover:text-red-500 bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            </PermissionGuard>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Main Task View */}
                    <section className="flex flex-col gap-4">
                        {/* Tabs & Controls */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e7eb] dark:border-[#28303b] pb-1">
                            <div className="flex gap-6">
                                <button
                                    onClick={() => setTab('assigned')}
                                    className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${tab === 'assigned' ? 'text-[rgb(var(--color-primary))] border-[rgb(var(--color-primary))]' : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-[rgb(var(--color-text))]'}`}
                                >
                                    My Assigned Tasks
                                    <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${tab === 'assigned' ? 'bg-[rgb(var(--color-primary))] text-white' : 'bg-gray-200 text-gray-600'}`}>
                                        {tasks.filter((t: Task) => (typeof t.assignedTo === 'object' ? t.assignedTo?._id : t.assignedTo) === user?._id).length}
                                    </span>
                                </button>
                                <button
                                    onClick={() => setTab('created')}
                                    className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${tab === 'created' ? 'text-[rgb(var(--color-primary))] border-[rgb(var(--color-primary))]' : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-[rgb(var(--color-text))]'}`}
                                >
                                    Created by Me
                                </button>
                            </div>
                            <div className="flex items-center gap-2 pb-2 sm:pb-0">
                                {/* Search (already at top but can filter further here if designed so, but sticking to top bar search binding for now) */}

                                {/* Filter: Sort Only */}
                                <div className="relative">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'priority' | 'newest')}
                                        className="appearance-none flex items-center gap-2 px-3 py-1.5 pr-8 bg-white dark:bg-[#1f2937] border border-[#e5e7eb] dark:border-[#28303b] rounded-lg text-xs font-medium text-[#111418] dark:text-white hover:bg-[#f3f4f6] dark:hover:bg-[#28303b] transition-colors focus:ring-0"
                                    >
                                        <option value="dueDate">Due Date</option>
                                        <option value="priority">Priority</option>
                                        <option value="newest">Newest</option>
                                    </select>
                                </div>

                                {/* Filter: Status */}
                                <div className="relative">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="appearance-none flex items-center gap-2 px-3 py-1.5 pr-8 bg-white dark:bg-[#1f2937] border border-[#e5e7eb] dark:border-[#28303b] rounded-lg text-xs font-medium text-[#111418] dark:text-white hover:bg-[#f3f4f6] dark:hover:bg-[#28303b] transition-colors focus:ring-0"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                                {/* Filter: Priority */}
                                <div className="relative">
                                    <select
                                        value={priorityFilter}
                                        onChange={(e) => setPriorityFilter(e.target.value)}
                                        className="appearance-none flex items-center gap-2 px-3 py-1.5 pr-8 bg-white dark:bg-[#1f2937] border border-[#e5e7eb] dark:border-[#28303b] rounded-lg text-xs font-medium text-[#111418] dark:text-white hover:bg-[#f3f4f6] dark:hover:bg-[#28303b] transition-colors focus:ring-0"
                                    >
                                        <option value="all">All Priority</option>
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Task List Container */}
                        <TaskList
                            tasks={filteredTasks}
                            projects={projects}
                            onEdit={(task) => { setEditingTask(task); setIsModalOpen(true); }}
                            onDelete={handleDelete}
                            onStatusUpdate={(task, newStatus) => handleCreateOrUpdate({
                                status: (newStatus || (task.status === 'completed' ? 'pending' : 'completed')) as Task['status'],
                            } as UpdateTaskDto, task._id)}
                        />
                    </section>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[rgb(var(--color-bg))] rounded-xl shadow-xl w-full max-w-xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                            <h2 className="text-xl font-bold text-[rgb(var(--color-text))]">{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
                        </div>
                        <TaskForm
                            initialData={editingTask}
                            onSubmit={handleCreateOrUpdate}
                            onCancel={() => setIsModalOpen(false)}
                            projects={manageableProjects}
                            canAssign={true}
                        />
                    </div>
                </div>
            )}

            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={user}
                onUpdate={handleUpdateProfile}
            />
        </div>
    );
};
