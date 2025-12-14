import type { Task } from '../types';
import { useAuthStore } from '../store/auth.store';
import clsx from 'clsx';

interface TaskCardProps {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
}

export const TaskCard = ({ task, onEdit, onDelete }: TaskCardProps) => {
    const { user } = useAuthStore();

    return (
        <div className="bg-white dark:bg-[#1e2736] rounded-lg shadow p-4 mb-4 hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{task.title}</h3>
                <span className={clsx('px-2 py-1 rounded-full text-xs font-medium',
                    task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' :
                            'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                )}>
                    {task.priority}
                </span>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{task.description}</p>

            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
                <span className={clsx('px-2 py-1 rounded-full font-medium',
                    task.status === 'completed' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' :
                        task.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                )}>
                    {task.status}
                </span>
                <span>
                    {task.assignedTo && typeof task.assignedTo === 'object'
                        ? `Assigned to: ${task.assignedTo.username}`
                        : 'Unassigned'}
                </span>
            </div>

            <div className="flex justify-end gap-2">
                <button
                    onClick={() => onEdit(task)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                    Edit
                </button>
                {user?.role === 'admin' && (
                    <button
                        onClick={() => onDelete(task._id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                        Delete
                    </button>
                )}
            </div>
        </div>
    );
};
