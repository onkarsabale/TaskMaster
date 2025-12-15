import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Task } from '../types';
import { PermissionGuard } from './PermissionGuard';
import { useAuthStore } from '../store/auth.store';

const taskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title matches max length'),
    description: z.string().optional(),
    status: z.enum(['pending', 'in-progress', 'completed']),
    priority: z.enum(['low', 'medium', 'high']),
    dueDate: z.string().optional(),
    assignedTo: z.string().optional(),
    projectId: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

import type { ProjectMember } from '../types/project';

interface TaskFormProps {
    initialData?: Task;
    onSubmit: (data: TaskFormData) => void;
    onCancel: () => void;
    projectId?: string;
    projectMembers?: ProjectMember[];
    projects?: import('../types/project').Project[]; // Passed when creating from Dashboard
}

export const TaskForm = ({ initialData, onSubmit, onCancel, projectMembers, projects, projectId }: TaskFormProps) => {
    const { user } = useAuthStore();
    const isEditMode = !!initialData;
    const isUser = user?.role === 'user';
    // User can only change status in edit mode; Admin/Manager can change all
    const isReadOnly = isEditMode && isUser;

    const { register, handleSubmit, control, formState: { errors } } = useForm<TaskFormData>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: initialData?.title || '',
            description: initialData?.description || '',
            status: initialData?.status || 'pending',
            priority: initialData?.priority || 'medium',
            dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
            assignedTo: typeof initialData?.assignedTo === 'object' ? (initialData.assignedTo as { _id: string })._id : (initialData?.assignedTo as string) || '',
            projectId: (() => {
                if (initialData) {
                    const p = (initialData as Task & { projectId?: string }).projectId || (initialData as Task & { project?: { _id: string } | string }).project;
                    return (typeof p === 'object' && p !== null) ? (p as { _id: string })._id : (p as string) || '';
                }
                return projectId || (projects && projects.length > 0 ? projects[0]._id : '');
            })(),
        },
    });

    const titleLength = (useWatch({ control, name: 'title' }) || '').length;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Task Title */}
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <label className="text-slate-700 dark:text-white text-base font-medium leading-normal">Task Title</label>
                        <span className="text-xs text-slate-400 dark:text-[#9da8b9]">{titleLength}/100</span>
                    </div>
                    <input
                        {...register('title')}
                        disabled={isReadOnly}
                        className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[rgb(var(--color-text))] focus:outline-0 focus:ring-2 focus:ring-[rgb(var(--color-primary))]/50 border bg-gray-50 dark:bg-gray-900 focus:border-[rgb(var(--color-primary))] h-12 placeholder:text-slate-400 px-4 py-2 text-base font-normal leading-normal transition-all ${errors.title ? 'border-red-500' : 'border-slate-200 dark:border-gray-700'} ${isReadOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
                        maxLength={100}
                        placeholder="e.g., Q3 Financial Report"
                        type="text"
                    />
                    {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
                </div>

                {/* Project Selector */}
                {projects && !isEditMode && (
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-700 dark:text-white text-base font-medium leading-normal">Project</label>
                        <div className="relative">
                            <select
                                {...register('projectId')}
                                className="form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[rgb(var(--color-text))] focus:outline-0 focus:ring-2 focus:ring-[rgb(var(--color-primary))]/50 border border-slate-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-[rgb(var(--color-primary))] h-12 placeholder:text-slate-400 px-4 pr-10 text-base font-normal leading-normal appearance-none transition-all cursor-pointer"
                            >
                                {projects.map((p) => (
                                    <option key={p._id} value={p._id}>
                                        {p.title}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-[#9da8b9]">
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>expand_more</span>
                            </div>
                        </div>
                        {errors.projectId && <span className="text-red-500 text-xs">{errors.projectId.message}</span>}
                    </div>
                )}

                {/* Description */}
                <div className="flex flex-col gap-2">
                    <label className="text-slate-700 dark:text-white text-base font-medium leading-normal">Description</label>
                    <textarea
                        {...register('description')}
                        disabled={isReadOnly}
                        className={`form-textarea flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[rgb(var(--color-text))] focus:outline-0 focus:ring-2 focus:ring-[rgb(var(--color-primary))]/50 border border-slate-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-[rgb(var(--color-primary))] min-h-[140px] placeholder:text-slate-400 p-4 text-base font-normal leading-normal transition-all ${isReadOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
                        placeholder="Add details about this task..."
                    ></textarea>
                </div>

                {/* Grid for Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Due Date */}
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-700 dark:text-white text-base font-medium leading-normal">Due Date</label>
                        <div className="relative flex items-center">
                            <input
                                {...register('dueDate')}
                                disabled={isReadOnly}
                                className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[rgb(var(--color-text))] focus:outline-0 focus:ring-2 focus:ring-[rgb(var(--color-primary))]/50 border border-slate-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-[rgb(var(--color-primary))] h-12 placeholder:text-slate-400 px-4 text-base font-normal leading-normal transition-all [color-scheme:light] dark:[color-scheme:dark] ${isReadOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
                                type="date"
                            />
                        </div>
                    </div>

                    {/* Priority */}
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-700 dark:text-white text-base font-medium leading-normal">Priority</label>
                        <div className="relative">
                            <select
                                {...register('priority')}
                                disabled={isReadOnly}
                                className={`form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[rgb(var(--color-text))] focus:outline-0 focus:ring-2 focus:ring-[rgb(var(--color-primary))]/50 border border-slate-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-[rgb(var(--color-primary))] h-12 placeholder:text-slate-400 px-4 pr-10 text-base font-normal leading-normal appearance-none transition-all cursor-pointer ${isReadOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-[#9da8b9]">
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>expand_more</span>
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-700 dark:text-white text-base font-medium leading-normal">Status</label>
                        <div className="relative">
                            <select
                                {...register('status')}
                                className="form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[rgb(var(--color-text))] focus:outline-0 focus:ring-2 focus:ring-[rgb(var(--color-primary))]/50 border border-slate-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-[rgb(var(--color-primary))] h-12 placeholder:text-slate-400 px-4 pr-10 text-base font-normal leading-normal appearance-none transition-all cursor-pointer"
                            >
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-[#9da8b9]">
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>expand_more</span>
                            </div>
                        </div>
                    </div>

                    {/* Assignee */}
                    <PermissionGuard allowedRoles={['admin', 'manager']}>
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-700 dark:text-white text-base font-medium leading-normal">Assignee</label>
                            <div className="relative">
                                {projectMembers ? (
                                    <>
                                        <select
                                            {...register('assignedTo')}
                                            disabled={isReadOnly}
                                            className="form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[rgb(var(--color-text))] focus:outline-0 focus:ring-2 focus:ring-[rgb(var(--color-primary))]/50 border border-slate-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-[rgb(var(--color-primary))] h-12 placeholder:text-slate-400 px-4 pr-10 text-base font-normal leading-normal appearance-none transition-all cursor-pointer"
                                        >
                                            <option value="">Unassigned</option>
                                            {projectMembers.map((m) => (
                                                <option key={m.user._id} value={m.user._id}>
                                                    {m.user.username} ({m.role.replace('_', ' ')})
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-[#9da8b9]">
                                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>expand_more</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <input
                                            {...register('assignedTo')}
                                            disabled={isReadOnly}
                                            placeholder="Enter username or email"
                                            className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[rgb(var(--color-text))] focus:outline-0 focus:ring-2 focus:ring-[rgb(var(--color-primary))]/50 border border-slate-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-[rgb(var(--color-primary))] h-12 placeholder:text-slate-400 px-4 text-base font-normal leading-normal transition-all ${isReadOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        />
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-[#9da8b9]">
                                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person_add</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </PermissionGuard>
                </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-gray-800 flex justify-end items-center gap-3 bg-[rgb(var(--color-bg))] mt-auto shrink-0">
                <button
                    type="button"
                    onClick={onCancel}
                    className="h-10 px-6 rounded-lg text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-[#1c2027] transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="h-10 px-6 rounded-lg bg-[rgb(var(--color-primary))] hover:bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(var(--color-primary))] dark:focus:ring-offset-gray-900 flex items-center gap-2"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add_task</span>
                    {initialData ? 'Update Task' : 'Create Task'}
                </button>
            </div>
        </form>
    );
};
