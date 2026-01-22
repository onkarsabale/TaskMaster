
import { useState, useRef, useEffect } from 'react';
import { useNotifications, useRespondToInvite, useMarkAsRead, useClearNotifications } from '../hooks/useNotifications';
import type { Notification } from '../types/notification';
import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { data: notifications = [], isLoading } = useNotifications();
    const respondMutation = useRespondToInvite();
    const markReadMutation = useMarkAsRead();
    const clearAllMutation = useClearNotifications();

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleRespond = async (id: string, action: 'accept' | 'reject') => {
        try {
            await respondMutation.mutateAsync({ id, action });
        } catch (error) {
            console.error('Failed to respond', error);
        }
    };

    const handleMarkAsRead = (id: string) => {
        markReadMutation.mutate(id);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative size-10 rounded-full flex items-center justify-center transition-all duration-200 ${isOpen ? 'bg-slate-100 dark:bg-slate-800 text-[rgb(var(--color-primary))]' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'}`}
                title="Notifications"
            >
                <span className="material-symbols-outlined text-[24px]">notifications</span>
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2.5 block size-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#111418] animate-pulse"></span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-[#1e2736] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-0 z-50 max-h-[400px] overflow-hidden flex flex-col origin-top-right"
                    >
                        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-[#111418]/30 backdrop-blur-sm sticky top-0 z-10">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="text-xs font-medium bg-[rgb(var(--color-primary))] text-white px-2 py-0.5 rounded-full shadow-sm shadow-blue-500/20">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                            {notifications.length > 0 && (
                                <button
                                    onClick={() => clearAllMutation.mutate()}
                                    disabled={clearAllMutation.isPending}
                                    className="text-xs font-medium text-slate-500 hover:text-red-500 transition-colors disabled:opacity-50"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>

                        <div className="overflow-y-auto flex-1 custom-scrollbar">
                            {isLoading ? (
                                <div className="p-8 flex items-center justify-center text-[rgb(var(--color-primary))]">
                                    <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                                    <div className="size-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3">
                                        <span className="material-symbols-outlined text-3xl opacity-40">notifications_off</span>
                                    </div>
                                    <p className="text-sm font-medium">No notifications</p>
                                    <p className="text-xs opacity-70 mt-1">You're all caught up!</p>
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    <AnimatePresence mode='popLayout'>
                                        {notifications.map((notification: Notification) => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                key={notification._id}
                                                className={`p-4 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-[#28303b] transition-colors ${!notification.isRead ? 'bg-blue-50/30 dark:bg-blue-500/5' : ''}`}
                                            >
                                                <div className="flex gap-4">
                                                    <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200 dark:border-slate-600">
                                                        {notification.sender?.avatar ? (
                                                            <img src={notification.sender.avatar} alt={notification.sender.username} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                                                {notification.sender?.username?.charAt(0).toUpperCase() || '?'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-slate-800 dark:text-gray-200 leading-snug">
                                                            <span className="font-semibold text-slate-900 dark:text-white hover:underline cursor-pointer">
                                                                {notification.sender?.username || 'System'}
                                                            </span>{' '}
                                                            <span className="text-slate-600 dark:text-slate-400">
                                                                {notification.message}
                                                            </span>
                                                        </p>
                                                        <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                                                            <span className="size-1 rounded-full bg-slate-300"></span>
                                                            {moment(notification.createdAt).fromNow()}
                                                        </p>

                                                        {notification.type === 'PROJECT_INVITE' && notification.status === 'pending' && (
                                                            <div className="flex gap-2 mt-3">
                                                                <button
                                                                    onClick={() => handleRespond(notification._id, 'accept')}
                                                                    className="px-4 py-1.5 bg-[rgb(var(--color-primary))] text-white text-xs font-semibold rounded-lg hover:bg-blue-600 active:scale-95 transition-all shadow-sm shadow-blue-500/20"
                                                                >
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRespond(notification._id, 'reject')}
                                                                    className="px-4 py-1.5 bg-white dark:bg-[#1e2736] border border-gray-200 dark:border-gray-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition-all"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {!notification.isRead && notification.type !== 'PROJECT_INVITE' && (
                                                        <button
                                                            onClick={() => handleMarkAsRead(notification._id)}
                                                            className="size-6 text-slate-400 hover:text-[rgb(var(--color-primary))] hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-full flex items-center justify-center transition-colors"
                                                            title="Mark as read"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">check</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                        {/* Footer or See All link if needed */}
                        <div className="p-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-[#111418]/50 text-center">
                            <button className="text-xs font-medium text-slate-500 hover:text-[rgb(var(--color-primary))] transition-colors">
                                View all notifications
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
