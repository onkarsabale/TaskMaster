import { createContext } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    description?: string;
}

export interface ToastContextValue {
    showToast: (message: string, type?: ToastType, description?: string) => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);
