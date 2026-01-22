import { useForm } from 'react-hook-form';

import type { Project } from '../../types/project';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const inviteSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['user', 'manager', 'admin']),
    projectId: z.string().optional(),
});

export type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: InviteFormData) => void;
    projects: Project[];
}

export const InviteMemberModal = ({ isOpen, onClose, onSubmit, projects }: InviteMemberModalProps) => {
    const { register, handleSubmit, formState: { errors } } = useForm<InviteFormData>({
        resolver: zodResolver(inviteSchema),
        defaultValues: {
            username: '',
            email: '',
            role: 'user',
            password: '',
            projectId: '',
        },
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1e2736] rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Invite New Member
                    </h3>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
                        <input
                            {...register('username')}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50"
                            placeholder="e.g. John Doe"
                        />
                        {errors.username && <span className="text-xs text-red-500">{errors.username.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                        <input
                            {...register('email')}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50"
                            placeholder="john@example.com"
                        />
                        {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                        <input
                            type="password"
                            {...register('password')}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50"
                            placeholder="Temporary password"
                        />
                        {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
                        <select
                            {...register('role')}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="user">Team Member</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Owner/Admin</option>
                        </select>
                        {errors.role && <span className="text-xs text-red-500">{errors.role.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Assign to Project (Optional)</label>
                        <select
                            {...register('projectId')}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="">No Project</option>
                            {projects.map(project => (
                                <option key={project._id} value={project._id}>{project.title}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                            Add Member
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
