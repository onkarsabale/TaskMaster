import type { Task } from '../types';
import type { Project } from '../types/project';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useState } from 'react';
import { StatusChangeModal } from './StatusChangeModal';

interface TaskListProps {
    tasks: Task[];
    projects?: Project[]; // Optional projects list to check permissions
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    onStatusUpdate: (task: Task, newStatus?: string) => void;
}

export const TaskList = ({ tasks, projects, onEdit, onDelete, onStatusUpdate }: TaskListProps) => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [statusTask, setStatusTask] = useState<Task | null>(null);

    return (
        <div className="bg-white dark:bg-[#1e2736] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
            {/* Header Row */}
            <div className="hidden sm:flex items-center px-4 py-3 bg-gray-50/80 dark:bg-[#111418]/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider backdrop-blur-sm">
                <div className="w-8"></div>
                <div className="flex-1">Task Name</div>
                <div className="w-28">Assignee</div>
                <div className="w-24">Priority</div>
                <div className="w-28">Status</div>
                <div className="w-28">Due Date</div>
                <div className="w-12"></div>
            </div>
            {tasks.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    No tasks found serving this criteria.
                </div>
            ) : (
                tasks.map(task => {
                    // Permission Check Logic
                    const isCreator = task.createdBy && typeof task.createdBy === 'object' && 'username' in task.createdBy
                        ? (task.createdBy as { _id: string })._id === user?._id
                        : task.createdBy === user?._id;

                    let isProjectManager = false;
                    if (projects && user) {
                        const taskProjectId = typeof task.project === 'object' ? (task.project as { _id: string })?._id : (task.project || (task as Task & { projectId?: string }).projectId);
                        const project = projects.find(p => p._id === taskProjectId);
                        if (project) {
                            const member = project.members.find(m => m.user._id === user._id);
                            if (member && member.role === 'project_manager') {
                                isProjectManager = true;
                            }
                            // Also check if owner
                            if (project.owner._id === user._id) {
                                isProjectManager = true;
                            }
                        }
                    }

                    const canDelete = user?.role === 'admin' || isCreator || isProjectManager;

                    return (
                        <div
                            key={task._id}
                            onClick={() => navigate(`/tasks/${task._id}`)}
                            className="group transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-[#111418]/50"
                        >
                            {/* Mobile Card View */}
                            <div className="sm:hidden flex flex-col p-4 border-b border-gray-100 dark:border-gray-800">
                                <div className="flex items-start gap-3 mb-3">
                                    <div
                                        onClick={(e) => { e.stopPropagation(); setStatusTask(task); }}
                                        className={`shrink-0 size-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600'}`}
                                    >
                                        {task.status === 'completed' && <span className="material-symbols-outlined text-[18px] text-white">check</span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h3 className={`font-bold text-sm leading-tight ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                                                {task.title}
                                            </h3>
                                            <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide
                                            ${task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                                    task.priority === 'medium' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                                                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-3 pl-9">
                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                        {task.assignedTo && typeof task.assignedTo === 'object' ? (
                                            <>
                                                <div className="size-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-[9px]">
                                                    {(task.assignedTo as { username: string }).username?.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="truncate max-w-[100px]">{(task.assignedTo as { username: string }).username}</span>
                                            </>
                                        ) : (
                                            <span className="italic">Unassigned</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 pl-9">
                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                                        <span className={`block size-2 rounded-full ${task.status === 'completed' ? 'bg-green-500' :
                                            task.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-400'
                                            }`}></span>
                                        {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                    </span>

                                    <div className="flex gap-4">
                                        <button onClick={(e) => { e.stopPropagation(); onEdit(task); }} className="text-[rgb(var(--color-primary))] text-xs font-medium p-1">Edit</button>
                                        {canDelete && (
                                            <button onClick={(e) => { e.stopPropagation(); onDelete(task._id); }} className="text-red-500 text-xs font-medium p-1">Delete</button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Desktop Row View */}
                            <div className="hidden sm:flex flex-row items-center px-4 py-3 border-l-4 border-transparent hover:border-[rgb(var(--color-primary))]">
                                <div className="w-8">
                                    <div
                                        onClick={(e) => { e.stopPropagation(); setStatusTask(task); }}
                                        className={`size-4 rounded-full border cursor-pointer ${task.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600 group-hover:border-[rgb(var(--color-primary))]'}`}
                                    >
                                        {task.status === 'completed' && <span className="material-symbols-outlined text-[16px] text-white -mt-0.5 -ml-0.5">check</span>}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0 pr-4">
                                    <p className={`text-sm font-medium truncate ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-[rgb(var(--color-text))]'}`}>{task.title}</p>
                                </div>
                                <div className="w-28 flex items-center gap-2">
                                    {task.assignedTo && typeof task.assignedTo === 'object' ? (
                                        <div className="flex items-center gap-2">
                                            <div className="size-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-[10px]">
                                                {(task.assignedTo as { username: string }).username?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[70px]">
                                                {(task.assignedTo as { username: string }).username}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400 dark:text-gray-500 italic">Unassigned</span>
                                    )}
                                </div>
                                <div className="w-24">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide
                                    ${task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                            task.priority === 'medium' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                                                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                                        {task.priority}
                                    </span>
                                </div>
                                <div className="w-28">
                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[rgb(var(--color-text))]">
                                        <span className={`block size-2 rounded-full ${task.status === 'completed' ? 'bg-green-500' :
                                            task.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-400'
                                            }`}></span>
                                        {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                    </span>
                                </div>
                                <div className="w-28 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                                </div>
                                <div className="w-12 flex justify-end gap-2 group-hover:opacity-100 opacity-0 transition-opacity">
                                    <button onClick={(e) => { e.stopPropagation(); onEdit(task); }} className="p-1.5 text-gray-400 hover:text-blue-500 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                    </button>
                                    {canDelete && (
                                        <button onClick={(e) => { e.stopPropagation(); onDelete(task._id); }} className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
            {statusTask && (
                <StatusChangeModal
                    task={statusTask}
                    onClose={() => setStatusTask(null)}
                    onConfirm={(newStatus) => {
                        onStatusUpdate(statusTask, newStatus);
                        setStatusTask(null);
                    }}
                />
            )}
        </div>
    );
};
