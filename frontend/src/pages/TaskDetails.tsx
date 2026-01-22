import { useParams, useNavigate } from 'react-router-dom';
import { ErrorState } from '../components/ErrorState';
import { useTask, useDeleteTask } from '../hooks/useTasks';
import { Loader } from '../components/Loader';
import { PermissionGuard } from '../components/PermissionGuard';
import { useConfirmDialog } from '../context/ConfirmDialogContext';

export const TaskDetails = () => {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const { mutate: deleteTask } = useDeleteTask();
    const { confirm } = useConfirmDialog();

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: 'Delete Task',
            message: 'Are you sure you want to delete this task? This action cannot be undone.',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            variant: 'danger',
        });
        if (taskId && confirmed) {
            deleteTask(taskId, {
                onSuccess: () => navigate('/dashboard')
            });
        }
    };

    const { data: task, isLoading: loading, isError, error } = useTask(taskId || '');

    // ...

    if (isError || (!loading && !task)) {
        return (
            <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#111418]">
                <header className="h-16 shrink-0 border-b border-gray-200 dark:border-gray-800 flex items-center px-6">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Back to Dashboard
                    </button>
                </header>
                <div className="flex-1 flex items-center justify-center">
                    <ErrorState
                        message="Task not found"
                        description={error instanceof Error ? error.message : "The task you are looking for does not exist or you don't have permission to view it."}
                        onRetry={() => navigate('/dashboard')}
                    />
                </div>
            </div>
        );
    }

    if (loading) return <Loader />;
    if (!task) return null;

    return (
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
            {/* Top Navbar */}
            <header className="h-16 flex items-center justify-between px-6 border-b border-[#e5e7eb] dark:border-[#282f39] bg-white dark:bg-[#111418] shrink-0 z-20">
                <div className="flex items-center gap-4 lg:gap-8 flex-1">
                    {/* Mobile Menu Toggle */}
                    <button className="lg:hidden p-2 -ml-2 text-slate-500 dark:text-white">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    {/* Breadcrumbs / Page Title */}
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-[#9da8b9] hidden md:flex">
                        <span className="cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => navigate('/')}>Dashboard</span>
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        <span>Tasks</span>
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        <span className="text-slate-900 dark:text-white font-medium truncate max-w-[200px]">{task.title}</span>
                    </div>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2">
                    <PermissionGuard allowedRoles={['admin']}>
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                            <span className="hidden sm:inline">Delete</span>
                        </button>
                    </PermissionGuard>
                </div>
            </header>

            {/* Scrollable Page Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
                <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
                    {/* Task Header Section */}
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex flex-col gap-2 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9da8b9]">Task ID: {task._id.slice(-6)}</span>
                                    <span className="size-1 bg-slate-400 rounded-full"></span>
                                    <span className="text-xs text-slate-400 dark:text-[#6b7280]">Last updated {new Date(task.updatedAt).toLocaleDateString()}</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-tight">
                                    {task.title}
                                </h1>
                            </div>
                        </div>
                        {/* Status & Priority Chips */}
                        <div className="flex flex-wrap gap-3 items-center">
                            {/* Status Chip */}
                            <div className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg bg-blue-50 dark:bg-[#1e2a3b] border border-blue-100 dark:border-blue-900/30">
                                <span className={`material-symbols-outlined text-[20px] ${task.status === 'in-progress' ? 'text-blue-500 animate-spin-slow' : 'text-slate-500'}`}>
                                    {task.status === 'completed' ? 'check_circle' : task.status === 'in-progress' ? 'sync' : 'pending'}
                                </span>
                                <span className="text-slate-700 dark:text-slate-200 text-sm font-semibold capitalize">{task.status.replace('-', ' ')}</span>
                            </div>
                            {/* Priority Chip */}
                            <div className={`flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg border  ${task.priority === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30' :
                                task.priority === 'medium' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900/30' :
                                    'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30'
                                }`}>
                                <span className={`material-symbols-outlined text-[20px] icon-filled ${task.priority === 'high' ? 'text-red-600 dark:text-red-400' :
                                    task.priority === 'medium' ? 'text-orange-600 dark:text-orange-400' :
                                        'text-green-600 dark:text-green-400'
                                    }`}>flag</span>
                                <span className={`text-sm font-semibold capitalize ${task.priority === 'high' ? 'text-red-700 dark:text-red-400' :
                                    task.priority === 'medium' ? 'text-orange-700 dark:text-orange-400' :
                                        'text-green-700 dark:text-green-400'
                                    }`}>{task.priority} Priority</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Grid Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-2">
                        {/* Left Column: Description, Subtasks, Activity */}
                        <div className="lg:col-span-8 flex flex-col gap-8">
                            {/* Description */}
                            <div className="flex flex-col gap-3 group/desc">
                                <h3 className="text-slate-900 dark:text-white text-lg font-bold flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-400">subject</span>
                                    Description
                                </h3>
                                <div className="min-h-[120px] p-4 rounded-xl border border-transparent bg-white dark:bg-[#161b22] text-slate-700 dark:text-slate-300 leading-relaxed text-base shadow-sm">
                                    {task.description || 'No description provided.'}
                                </div>
                            </div>

                            {/* Placeholder Subtasks (UI Only for now) */}
                            <div className="flex flex-col gap-3 opacity-50 pointer-events-none filter grayscale">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-slate-900 dark:text-white text-lg font-bold flex items-center gap-2">
                                        <span className="material-symbols-outlined text-slate-400">check_circle</span>
                                        Subtasks (Coming Soon)
                                    </h3>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#282f39]">
                                        <input disabled className="mt-1 size-5 rounded border-slate-300 dark:border-[#3b4554] text-[rgb(var(--color-primary))] bg-transparent" type="checkbox" />
                                        <span className="text-slate-500 dark:text-slate-400">Example subtask item...</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Meta Info */}
                        <div className="lg:col-span-4 flex flex-col gap-6">
                            {/* Attributes Card */}
                            <div className="bg-white dark:bg-[#18212f] rounded-xl border border-gray-200 dark:border-[#282f39] shadow-sm overflow-hidden">
                                <div className="px-4 py-3 border-b border-gray-200 dark:border-[#282f39] bg-slate-50 dark:bg-[#1e2736] flex justify-between items-center">
                                    <h4 className="text-sm font-bold text-slate-700 dark:text-white">Details</h4>
                                </div>
                                <div className="p-4 flex flex-col gap-5">
                                    {/* Assigned To */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-medium text-slate-500 dark:text-[#9da8b9] uppercase tracking-wide">Assigned to</label>
                                        <div className="flex items-center gap-3 p-2 -ml-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#282f39] transition-colors">
                                            <div className="bg-[rgb(var(--color-primary))]/10 flex items-center justify-center rounded-full size-8 text-[rgb(var(--color-primary))] font-bold text-xs">
                                                {(typeof task.assignedTo === 'object' ? task.assignedTo?.username : 'Unassigned')?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium text-slate-900 dark:text-white flex-1">
                                                {typeof task.assignedTo === 'object' ? task.assignedTo?.username : 'Unassigned'}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Due Date */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-medium text-slate-500 dark:text-[#9da8b9] uppercase tracking-wide">Due Date</label>
                                        <div className="flex items-center gap-3 p-2 -ml-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#282f39] transition-colors">
                                            <div className="flex items-center justify-center size-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                                                <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-slate-900 dark:text-white">
                                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
