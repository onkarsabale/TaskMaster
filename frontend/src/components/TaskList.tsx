import type { Task } from '../types';
import { useNavigate } from 'react-router-dom';
import { PermissionGuard } from './PermissionGuard';

interface TaskListProps {
    tasks: Task[];
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    onStatusUpdate: (task: Task) => void;
}

export const TaskList = ({ tasks, onEdit, onDelete, onStatusUpdate }: TaskListProps) => {
    const navigate = useNavigate();

    return (
        <div className="bg-[rgb(var(--color-bg))] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col divide-y divide-gray-200 dark:divide-gray-800">
            {/* Header Row */}
            <div className="hidden sm:flex items-center px-4 py-3 bg-gray-50 dark:bg-slate-900/50 text-xs font-medium text-gray-500 dark:text-gray-400 rounded-t-xl">
                <div className="w-8"></div>
                <div className="flex-1">Task Name</div>
                <div className="w-24">Priority</div>
                <div className="w-28">Status</div>
                <div className="w-28">Due Date</div>
                <div className="w-12"></div>
            </div>
            {tasks.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No tasks found serving this criteria.
                </div>
            ) : (
                tasks.map(task => (
                    <div
                        key={task._id}
                        onClick={() => navigate(`/tasks/${task._id}`)}
                        className="group flex flex-col sm:flex-row sm:items-center px-4 py-4 sm:py-3 hover:bg-gray-50 dark:hover:bg-slate-900/50 transition-colors bg-[rgb(var(--color-bg))] cursor-pointer"
                    >
                        <div className="hidden sm:block w-8">
                            <div
                                onClick={(e) => { e.stopPropagation(); onStatusUpdate(task); }}
                                className={`size-4 rounded-full border cursor-pointer ${task.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600 group-hover:border-[rgb(var(--color-primary))]'}`}
                            >
                                {task.status === 'completed' && <span className="material-symbols-outlined text-[16px] text-white -mt-0.5 -ml-0.5">check</span>}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0 pr-4 mb-2 sm:mb-0">
                            <p className={`text-sm font-medium truncate ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-[rgb(var(--color-text))]'}`}>{task.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 sm:hidden flex items-center gap-2">
                                <span>{task.priority}</span>
                                <span>•</span>
                                <span>{task.status}</span>
                            </p>
                        </div>
                        <div className="w-full sm:w-24 mb-2 sm:mb-0">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide
                                ${task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                    task.priority === 'medium' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                                {task.priority}
                            </span>
                        </div>
                        <div className="w-full sm:w-28 mb-2 sm:mb-0">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[rgb(var(--color-text))]">
                                <span className={`block size-2 rounded-full ${task.status === 'completed' ? 'bg-green-500' :
                                    task.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-400'
                                    }`}></span>
                                {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                            </span>
                        </div>
                        <div className="w-full sm:w-28 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2 sm:mb-0">
                            <span className="material-symbols-outlined text-[16px] sm:hidden">calendar_today</span>
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                        </div>
                        <div className="flex sm:hidden justify-end w-full border-t border-gray-100 dark:border-gray-800 pt-2 mt-1 gap-4">
                            <button onClick={(e) => { e.stopPropagation(); onEdit(task); }} className="text-[rgb(var(--color-primary))] text-xs font-medium">Edit</button>
                            <PermissionGuard allowedRoles={['admin']}>
                                <button onClick={(e) => { e.stopPropagation(); onDelete(task._id); }} className="text-red-500 text-xs font-medium">Delete</button>
                            </PermissionGuard>
                        </div>
                        <div className="hidden sm:flex w-12 justify-end gap-2 group-hover:opacity-100 opacity-0 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); onEdit(task); }} className="p-1.5 text-gray-400 hover:text-blue-500 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                <span className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                            <PermissionGuard allowedRoles={['admin']}>
                                <button onClick={(e) => { e.stopPropagation(); onDelete(task._id); }} className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                            </PermissionGuard>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};
