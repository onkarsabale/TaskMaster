import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import type { User } from '../types/user';

const profileSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    avatar: z.string().url('Invalid URL').or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onUpdate: (data: ProfileFormData) => Promise<void>;
}

export const ProfileModal = ({ isOpen, onClose, user, onUpdate }: ProfileModalProps) => {
    const [isLoading, setIsLoading] = useState(false);

    // Reset form when user changes or modal opens
    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            username: user?.username || '',
            avatar: user?.avatar || '',
        },
    });

    useEffect(() => {
        if (isOpen && user) {
            reset({
                username: user.username,
                avatar: user.avatar || '',
            });
        }
    }, [isOpen, user, reset]);

    const avatarUrl = watch('avatar');

    const onSubmit = async (data: ProfileFormData) => {
        setIsLoading(true);
        try {
            await onUpdate(data);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-[rgb(var(--color-bg))] rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800"
                    >
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-[rgb(var(--color-text))]">Edit Profile</h2>
                            <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 flex flex-col gap-6">
                            {/* Avatar Preview */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="size-24 rounded-full bg-gray-200 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 overflow-hidden flex items-center justify-center">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-4xl text-gray-400">person</span>
                                    )}
                                </div>
                            </div>

                            {/* Username */}
                            <label className="flex flex-col gap-1.5">
                                <span className="text-sm font-medium text-[rgb(var(--color-text))]">Username</span>
                                <input
                                    {...register('username')}
                                    className="form-input flex w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-[rgb(var(--color-bg))] h-10 px-3 text-sm focus:border-[rgb(var(--color-primary))] focus:ring-1 focus:ring-[rgb(var(--color-primary))] transition-colors"
                                    type="text"
                                    placeholder="Your username"
                                />
                                {errors.username && <span className="text-red-500 text-xs">{errors.username.message}</span>}
                            </label>

                            {/* Avatar URL */}
                            <label className="flex flex-col gap-1.5">
                                <span className="text-sm font-medium text-[rgb(var(--color-text))]">Avatar URL</span>
                                <input
                                    {...register('avatar')}
                                    className="form-input flex w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-[rgb(var(--color-bg))] h-10 px-3 text-sm focus:border-[rgb(var(--color-primary))] focus:ring-1 focus:ring-[rgb(var(--color-primary))] transition-colors"
                                    type="text"
                                    placeholder="https://example.com/avatar.jpg"
                                />
                                <span className="text-xs text-slate-500">Paste a direct link to an image (optional)</span>
                                {errors.avatar && <span className="text-red-500 text-xs">{errors.avatar.message}</span>}
                            </label>

                            {/* Read-only Email */}
                            <div className="flex flex-col gap-1.5 opacity-60">
                                <span className="text-sm font-medium text-[rgb(var(--color-text))]">Email</span>
                                <div className="h-10 px-3 flex items-center rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm text-slate-500">
                                    {user?.email}
                                </div>
                            </div>

                            {/* Read-only User ID */}
                            <div className="flex flex-col gap-1.5">
                                <span className="text-sm font-medium text-[rgb(var(--color-text))]">User ID</span>
                                <div className="h-10 px-3 flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm text-slate-500 font-mono">
                                    <span className="truncate">{user?._id}</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigator.clipboard.writeText(user?._id || '');
                                            // Ideally we would show a toast here, but we'd need to inject useToast or pass a prop.
                                            // For simplicity in this modal, we'll just rely on the user knowing they clicked it or button feedback effect.
                                            alert('ID copied to clipboard');
                                        }}
                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                                        title="Copy ID"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-4 py-2 text-sm font-bold text-white bg-[rgb(var(--color-primary))] hover:bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
