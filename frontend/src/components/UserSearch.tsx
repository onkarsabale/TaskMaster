import { useState, useEffect } from 'react';
import api from '../api/client';
import type { User } from '../types/user';

interface UserSearchProps {
    onSelect: (user: User) => void;
    placeholder?: string;
}

export const UserSearch = ({ onSelect, placeholder = 'Search users by email...' }: UserSearchProps) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Debounce search
    useEffect(() => {
        const search = async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                // Determine search field based on input (simple check for now, or just enforce email)
                // User asked specifically for email match, so let's default to field=email or all but prioritize email display
                const type = query.includes('@') ? 'email' : 'all';
                const { data } = await api.get(`/users/search?q=${query}&type=${type}`);
                setResults(data);
            } catch (error) {
                console.error('Search failed', error);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(search, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    return (
        <div className="w-full flex flex-col gap-4">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="form-input block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-[rgb(var(--color-bg))] h-10 pl-10 pr-3 text-sm focus:border-[rgb(var(--color-primary))] focus:ring-1 focus:ring-[rgb(var(--color-primary))] transition-colors"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400 text-[20px]">search</span>
                </div>
                {isLoading && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <div className="size-4 border-2 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </div>

            {/* Results Area - Card Grid */}
            <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto pr-1">
                {results.length > 0 ? (
                    results.map((user) => (
                        <div key={user._id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e2736] hover:shadow-md transition-all">
                            {/* Avatar */}
                            <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0 overflow-hidden">
                                {user.avatar ? (
                                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    (user.username || '?').charAt(0).toUpperCase()
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-[rgb(var(--color-text))] truncate">{user.username || 'Unknown User'}</p>
                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                            </div>

                            {/* Action */}
                            <button
                                onClick={() => onSelect(user)}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-[rgb(var(--color-primary))] hover:bg-blue-600 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                            >
                                <span className="material-symbols-outlined text-[16px]">send</span>
                                Invite
                            </button>
                        </div>
                    ))
                ) : (
                    query && !isLoading && (
                        <div className="text-center py-4 text-sm text-slate-500">
                            No users found. Try searching by full email.
                        </div>
                    )
                )}
            </div>
        </div>
    );
};
