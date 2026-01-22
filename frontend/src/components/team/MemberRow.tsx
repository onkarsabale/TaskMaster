import type { User } from '../../types/user';

interface MemberRowProps {
    member: User;
    currentUser: User | null;
    onEdit: (member: User) => void;
    onDelete: (id: string) => void;
    canManage: boolean;
}

export const MemberRow = ({ member, currentUser, onEdit, onDelete, canManage }: MemberRowProps) => {
    const isSelf = currentUser?._id === member._id;

    return (
        <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#28303b] transition-colors last:border-0">
            <td className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm uppercase">
                    {member.avatar ? (
                        <img src={member.avatar} alt={member.username} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        member.username.charAt(0).toUpperCase()
                    )}
                </div>
                <div>
                    <div className="font-medium text-slate-900 dark:text-white">{member.username}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 sm:hidden">{member.email}</div>
                </div>
            </td>
            <td className="p-4 text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">{member.email}</td>
            <td className="p-4">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium uppercase ${member.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                        member.role === 'manager' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                    {member.role === 'admin' ? 'Owner' : member.role}
                </span>
            </td>
            {canManage && (
                <td className="p-4 text-right">
                    {!isSelf && (
                        <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={() => onEdit(member)}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
                                title="Edit Role / Manage"
                            >
                                <span className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                            <button
                                onClick={() => onDelete(member._id)}
                                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors"
                                title="Remove Member"
                            >
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                        </div>
                    )}
                </td>
            )}
        </tr>
    );
};
