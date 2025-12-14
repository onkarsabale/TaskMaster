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

    const priorityColors = {
        low: 'bg-green-100 text-green-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-red-100 text-red-800',
    };

    const statusColors = {
        pending: 'bg-gray-100 text-gray-800',
        'in-progress': 'bg-blue-100 text-blue-800',
        completed: 'bg-purple-100 text-purple-800',
    };

    return (
        <div className="bg-white rounded-lg shadow p-4 mb-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                <span className={clsx('px-2 py-1 rounded-full text-xs font-medium', priorityColors[task.priority])}>
                    {task.priority}
                </span>
            </div>

            <p className="text-gray-600 text-sm mb-3">{task.description}</p>

            <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                <span className={clsx('px-2 py-1 rounded-full font-medium', statusColors[task.status])}>
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
