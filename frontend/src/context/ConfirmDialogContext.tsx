import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

interface ConfirmDialogOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

interface ConfirmDialogContextValue {
    confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | undefined>(undefined);

export const useConfirmDialog = () => {
    const context = useContext(ConfirmDialogContext);
    if (!context) {
        throw new Error('useConfirmDialog must be used within a ConfirmDialogProvider');
    }
    return context;
};

interface DialogState extends ConfirmDialogOptions {
    isOpen: boolean;
    resolve: ((value: boolean) => void) | null;
}

export const ConfirmDialogProvider = ({ children }: { children: ReactNode }) => {
    const [dialog, setDialog] = useState<DialogState>({
        isOpen: false,
        title: '',
        message: '',
        resolve: null,
    });

    const confirm = useCallback((options: ConfirmDialogOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setDialog({
                isOpen: true,
                ...options,
                resolve,
            });
        });
    }, []);

    const handleConfirm = () => {
        dialog.resolve?.(true);
        setDialog((prev) => ({ ...prev, isOpen: false }));
    };

    const handleCancel = () => {
        dialog.resolve?.(false);
        setDialog((prev) => ({ ...prev, isOpen: false }));
    };

    const variantStyles = {
        danger: {
            icon: 'warning',
            iconBg: 'bg-red-100 dark:bg-red-900/30',
            iconColor: 'text-red-600 dark:text-red-400',
            confirmBtn: 'bg-red-600 hover:bg-red-700 text-white',
        },
        warning: {
            icon: 'help',
            iconBg: 'bg-amber-100 dark:bg-amber-900/30',
            iconColor: 'text-amber-600 dark:text-amber-400',
            confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white',
        },
        info: {
            icon: 'info',
            iconBg: 'bg-blue-100 dark:bg-blue-900/30',
            iconColor: 'text-blue-600 dark:text-blue-400',
            confirmBtn: 'bg-blue-600 hover:bg-blue-700 text-white',
        },
    };

    const variant = dialog.variant || 'danger';
    const styles = variantStyles[variant];

    return (
        <ConfirmDialogContext.Provider value={{ confirm }}>
            {children}
            {createPortal(
                <AnimatePresence>
                    {dialog.isOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                            onClick={handleCancel}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                transition={{ type: 'spring', duration: 0.3 }}
                                className="bg-white dark:bg-[#1e2736] rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2 rounded-full ${styles.iconBg}`}>
                                            <span className={`material-symbols-outlined text-[24px] ${styles.iconColor}`}>
                                                {styles.icon}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                                {dialog.title}
                                            </h3>
                                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                                {dialog.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-[#161d29] border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={handleCancel}
                                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#1e2736] border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        {dialog.cancelText || 'Cancel'}
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${styles.confirmBtn}`}
                                    >
                                        {dialog.confirmText || 'Confirm'}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </ConfirmDialogContext.Provider>
    );
};
