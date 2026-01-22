import type { User } from '../../types/user';

interface MemberCardProps {
    member: User;
    currentUser: User | null;
    onEdit: (member: User) => void;
    onDelete: (id: string) => void;
    canManage: boolean;
}

export const MemberCard = ({ member, currentUser, onEdit, onDelete, canManage }: MemberCardProps) => {
    const isSelf = currentUser?._id === member._id;

    return (
        <div className="bg-white dark:bg-[#1e2736] rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-4 shadow-sm">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg uppercase">
                        {member.avatar ? (
                            <img src={member.avatar} alt={member.username} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            member.username.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{member.username}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{member.email}</p>
                    </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${member.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                        member.role === 'manager' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                    {member.role === 'admin' ? 'Owner' : member.role}
                </span>
            </div>

            {canManage && !isSelf && (
                <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <button
                        onClick={() => onEdit(member)}
                        className="flex-1 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        Edit Role
                    </button>
                    <button
                        onClick={() => onDelete(member._id)}
                        className="px-3 py-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 transition-colors"
                        title="Remove"
                    >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                </div>
            )}
        </div>
    );
};
