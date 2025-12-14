import { useState, type ReactNode, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ToastContext, type Toast, type ToastType } from './ToastConfig';

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info', description?: string) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type, description }]);

        // Auto remove
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {createPortal(
                <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
                    <AnimatePresence>
                        {toasts.map((toast) => (
                            <motion.div
                                key={toast.id}
                                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                className="pointer-events-auto min-w-[300px] max-w-sm bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-gray-800 shadow-lg rounded-xl p-4 flex items-start gap-3"
                            >
                                <div className={`mt-0.5 p-1 rounded-full ${toast.type === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                                    toast.type === 'error' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                        'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                    }`}>
                                    <span className="material-symbols-outlined text-[20px]">
                                        {toast.type === 'success' ? 'check_circle' :
                                            toast.type === 'error' ? 'error' : 'notifications'}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                                        {toast.message}
                                    </h4>
                                    {toast.description && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-normal">
                                            {toast.description}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};
