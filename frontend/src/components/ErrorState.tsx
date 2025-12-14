import { useNavigate } from 'react-router-dom';

interface ErrorStateProps {
    message?: string;
    description?: string;
    onRetry?: () => void;
}

export const ErrorState = ({
    message = 'Something went wrong',
    description = 'We encountered an error while loading your data. Please try again.',
    onRetry
}: ErrorStateProps) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-6 text-center animate-in fade-in zoom-in duration-300">
            <div className="size-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4 text-red-500">
                <span className="material-symbols-outlined text-[32px]">error</span>
            </div>
            <h3 className="text-xl font-bold text-[rgb(var(--color-text))] mb-2">{message}</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">{description}</p>
            <div className="flex gap-4">
                <button
                    onClick={() => navigate(0)} // Refresh page
                    className="px-4 py-2 rounded-lg border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800 text-slate-700 dark:text-slate-300 font-medium transition-colors"
                >
                    Refresh Page
                </button>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="px-4 py-2 rounded-lg bg-[rgb(var(--color-primary))] text-white font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
                    >
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
};
