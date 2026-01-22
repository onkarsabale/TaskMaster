import { useState } from 'react';
import { TaskList } from '../components/TaskList';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import { useAuthStore } from '../store/auth.store';
import { Loader } from '../components/Loader';
import { ErrorState } from '../components/ErrorState';
import { TaskForm } from '../components/TaskForm';
import type { Task, CreateTaskDto, UpdateTaskDto } from '../types/task';
import { useProjects } from '../hooks/useProjects';
import { useConfirmDialog } from '../context/ConfirmDialogContext';
import { useSidebar } from '../context/SidebarContext';

export const MyTasks = () => {
    const { user } = useAuthStore();
    const { toggle } = useSidebar();

    // Filter specifically for tasks assigned to current user
    const { data: tasks = [], isLoading, error } = useTasks({ assignedTo: user?._id });
    const { data: projects = [] } = useProjects(); // For create task dropdown

    const createTaskMutation = useCreateTask();
    const updateTaskMutation = useUpdateTask();
    const deleteTaskMutation = useDeleteTask();
    const { confirm } = useConfirmDialog();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

    const handleCreateOrUpdate = async (data: CreateTaskDto | UpdateTaskDto, taskId?: string) => {
        try {
            if (taskId || editingTask) {
                await updateTaskMutation.mutateAsync({ id: taskId || editingTask!._id, data });
            } else {
                await createTaskMutation.mutateAsync(data as CreateTaskDto);
            }
            setIsModalOpen(false);
            setEditingTask(undefined);
        } catch (error) {
            console.error(error);
            alert('Failed to save task');
        }
    };

    const handleDelete = async (id: string) => {
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

    if (isLoading) return <Loader />;
    if (error) return <ErrorState message="Failed to load your tasks" />;

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[rgb(var(--color-bg))]">
            <header className="shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111418] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggle}
                        className="lg:hidden text-[#637588] dark:text-[#9da8b9]"
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Tasks</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Tasks specifically assigned to you</p>
                    </div>
                </div>
                <button
                    onClick={() => { setEditingTask(undefined); setIsModalOpen(true); }}
                    className="px-4 py-2 bg-[rgb(var(--color-primary))] text-white font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                    <span className="material-symbols-outlined">add</span>
                    <span className="hidden sm:inline">New Task</span>
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="max-w-5xl mx-auto space-y-8">
                    {tasks.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-[#1e2736] rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                                <span className="material-symbols-outlined text-3xl">check_circle</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No tasks assigned to you</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">You're all caught up! Create a new task or ask your manager to assign you one.</p>
                        </div>
                    ) : (
                        (Object.entries(tasks.reduce((acc: Record<string, Task[]>, task: Task) => {
                            // Extract project ID safely (handle both string ID and populated object)
                            const projectId = typeof task.project === 'object' && task.project !== null
                                ? (task.project as { _id: string })._id
                                : task.project || 'unassigned';

                            if (!acc[projectId]) acc[projectId] = [];
                            acc[projectId].push(task);
                            return acc;
                        }, {} as Record<string, Task[]>)) as [string, Task[]][]).map(([projectId, projectTasks]) => {
                            const project = projects.find(p => p._id === projectId);
                            const projectTitle = project ? project.title : (projectId === 'unassigned' ? 'Unassigned' : 'Unknown Project');

                            return (
                                <div key={projectId} className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2 px-1">
                                        <span className="material-symbols-outlined text-slate-400">folder</span>
                                        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{projectTitle}</h2>
                                    </div>
                                    <TaskList
                                        tasks={projectTasks}
                                        projects={projects}
                                        onEdit={(task) => { setEditingTask(task); setIsModalOpen(true); }}
                                        onDelete={handleDelete}
                                        onStatusUpdate={(task, newStatus) => handleCreateOrUpdate({
                                            status: (newStatus || (task.status === 'completed' ? 'pending' : 'completed')) as Task['status'],
                                        } as UpdateTaskDto, task._id)}
                                    />
                                </div>
                            );
                        })
                    )}
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
                            projects={projects} // Pass projects for selection
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
