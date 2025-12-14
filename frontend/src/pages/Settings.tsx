import { useAuthStore } from '../store/auth.store';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import * as authApi from '../api/auth.api';
import { useState } from 'react';

const profileSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    avatar: z.string().url('Invalid URL').optional().or(z.literal('')),
    // email is read-only usually
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const Settings = () => {
    const { user, login } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            username: user?.username || '',
            avatar: user?.avatar || '',
        },
    });

    const onSubmit = async (data: ProfileFormData) => {
        setIsLoading(true);
        setSuccessMessage('');
        try {
            const updatedUser = await authApi.updateProfile(data);
            login(updatedUser); // Update local store
            setSuccessMessage('Profile updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error(error);
            alert('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[rgb(var(--color-bg))] overflow-hidden">
            <header className="shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111418] px-6 py-4">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account preferences</p>
            </header>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white dark:bg-[#1e2736] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Profile Information</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Update your public profile details</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                            {/* Avatar Section */}
                            <div className="flex items-center gap-6">
                                <div className="shrink-0">
                                    <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-4 border-white dark:border-[#1e2736] shadow-md">
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="material-symbols-outlined text-4xl text-slate-400">person</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Avatar URL
                                    </label>
                                    <input
                                        {...register('avatar')}
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#111418] text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="https://example.com/your-photo.jpg"
                                    />
                                    {errors.avatar && <p className="mt-1 text-xs text-red-500">{errors.avatar.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Username
                                    </label>
                                    <input
                                        {...register('username')}
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#111418] text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                    {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-[#111418] text-slate-500 cursor-not-allowed"
                                    />
                                    <p className="mt-1 text-xs text-slate-400">Email cannot be changed.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Role
                                    </label>
                                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-slate-600 dark:text-slate-300 capitalize">
                                        {user?.role}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
                                {successMessage && (
                                    <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                                        <span className="material-symbols-outlined text-lg">check_circle</span>
                                        {successMessage}
                                    </span>
                                )}
                                {!successMessage && <span></span>} {/* Spacer */}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg shadow-blue-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="mt-8 bg-white dark:bg-[#1e2736] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden opacity-70 hover:opacity-100 transition-opacity">
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Application Settings</h3>
                            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                                <div>
                                    <div className="font-medium text-slate-700 dark:text-slate-300">Dark Mode</div>
                                    <div className="text-sm text-slate-500">Toggle application theme</div>
                                </div>
                                <div className="text-xs text-slate-400 italic">Coming soon</div>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <div>
                                    <div className="font-medium text-slate-700 dark:text-slate-300">Notifications</div>
                                    <div className="text-sm text-slate-500">Manage email and push notifications</div>
                                </div>
                                <div className="text-xs text-slate-400 italic">Coming soon</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
