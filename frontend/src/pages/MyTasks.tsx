import { useState } from 'react';
import { TaskList } from '../components/TaskList';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import { useAuthStore } from '../store/auth.store';
import { Loader } from '../components/Loader';
import { ErrorState } from '../components/ErrorState';
import { TaskForm } from '../components/TaskForm';
import type { Task, CreateTaskDto, UpdateTaskDto } from '../types/task';
import { useProjects } from '../hooks/useProjects';

export const MyTasks = () => {
    const { user } = useAuthStore();
    // Filter specifically for tasks assigned to current user
    const { data: tasks = [], isLoading, error } = useTasks({ assignedTo: user?._id });
    const { data: projects = [] } = useProjects(); // For create task dropdown

    const createTaskMutation = useCreateTask();
    const updateTaskMutation = useUpdateTask();
    const deleteTaskMutation = useDeleteTask();

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
        if (confirm('Are you sure you want to delete this task?')) {
            await deleteTaskMutation.mutateAsync(id);
        }
    };

    if (isLoading) return <Loader />;
    if (error) return <ErrorState message="Failed to load your tasks" />;

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[rgb(var(--color-bg))]">
            <header className="shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111418] px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Tasks</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Tasks specifically assigned to you</p>
                </div>
                <button
                    onClick={() => { setEditingTask(undefined); setIsModalOpen(true); }}
                    className="px-4 py-2 bg-[rgb(var(--color-primary))] text-white font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                    <span className="material-symbols-outlined">add</span>
                    New Task
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-5xl mx-auto">
                    {tasks.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-[#1e2736] rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                                <span className="material-symbols-outlined text-3xl">check_circle</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No tasks assigned to you</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">You're all caught up! Create a new task or ask your manager to assign you one.</p>
                        </div>
                    ) : (
                        <TaskList
                            tasks={tasks}
                            onEdit={(task) => { setEditingTask(task); setIsModalOpen(true); }}
                            onDelete={handleDelete}
                            onStatusUpdate={(task, newStatus) => handleCreateOrUpdate({
                                status: (newStatus || (task.status === 'completed' ? 'pending' : 'completed')) as Task['status'],
                            } as UpdateTaskDto, task._id)}
                        />
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1e2736] rounded-xl shadow-xl w-full max-w-xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
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
