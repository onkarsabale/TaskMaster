import type { Task } from '../types';

interface StatusChangeModalProps {
    task: Task;
    onClose: () => void;
    onConfirm: (status: string) => void;
}

export const StatusChangeModal = ({ task, onClose, onConfirm }: StatusChangeModalProps) => {
    const statuses = ['pending', 'in-progress', 'completed'];

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-[rgb(var(--color-bg))] rounded-xl shadow-xl w-full max-w-sm border border-gray-200 dark:border-gray-800 p-6" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-[rgb(var(--color-text))] mb-2">Update Status</h3>
                <p className="text-sm text-slate-500 mb-6">Select a new status for <span className="font-medium text-[rgb(var(--color-text))]">"{task.title}"</span></p>

                <div className="flex flex-col gap-2">
                    {statuses.map(status => (
                        <button
                            key={status}
                            onClick={() => onConfirm(status)}
                            className={`w-full py-3 px-4 rounded-lg border text-sm font-medium transition-all flex items-center justify-between
                                ${task.status === status
                                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                                    : 'bg-white dark:bg-[#111418] border-gray-200 dark:border-gray-700 text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-[#1e2736]'
                                }`}
                        >
                            <span className="capitalize">{status.replace('-', ' ')}</span>
                            {task.status === status && <span className="material-symbols-outlined text-[18px]">check_circle</span>}
                        </button>
                    ))}
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium text-sm"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
