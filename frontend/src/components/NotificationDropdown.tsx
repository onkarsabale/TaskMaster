
import { useState, useRef, useEffect } from 'react';
import { useNotifications, useRespondToInvite, useMarkAsRead } from '../hooks/useNotifications';
import type { Notification } from '../types/notification';
import moment from 'moment';

export const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { data: notifications = [], isLoading } = useNotifications();
    const respondMutation = useRespondToInvite();
    const markReadMutation = useMarkAsRead();

    const unreadCount = notifications.filter(n => n.status === 'pending').length;

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
                className="relative p-2 text-[#637588] dark:text-[#9da8b9] hover:bg-[#f3f4f6] dark:hover:bg-[#1f2937] rounded-full transition-colors"
                title="Notifications"
            >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#111418]"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#1e2736] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 max-h-[400px] overflow-y-auto">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-800 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{unreadCount} new</span>}
                    </div>

                    {isLoading ? (
                        <div className="p-4 text-center text-slate-500">Loading...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">notifications_off</span>
                            <p>No notifications</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((notification: Notification) => (
                                <div
                                    key={notification._id}
                                    className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#28303b] transition-colors ${notification.status === 'pending' ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                >
                                    <div className="flex gap-3">
                                        <div className="size-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                            {notification.sender?.avatar ? (
                                                <img src={notification.sender.avatar} alt={notification.sender.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xs font-bold">{notification.sender?.username?.charAt(0).toUpperCase() || '?'}</span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-slate-800 dark:text-gray-200">
                                                <span className="font-semibold">{notification.sender?.username || 'System'}</span> {notification.message}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">{moment(notification.createdAt).fromNow()}</p>

                                            {notification.type === 'PROJECT_INVITE' && notification.status === 'pending' && (
                                                <div className="flex gap-2 mt-3">
                                                    <button
                                                        onClick={() => handleRespond(notification._id, 'accept')}
                                                        className="px-3 py-1.5 bg-[rgb(var(--color-primary))] text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleRespond(notification._id, 'reject')}
                                                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        {notification.status === 'pending' && notification.type !== 'PROJECT_INVITE' && (
                                            <button
                                                onClick={() => handleMarkAsRead(notification._id)}
                                                className="text-gray-400 hover:text-[rgb(var(--color-primary))]"
                                                title="Mark as read"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
