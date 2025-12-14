import { useParams, useNavigate } from 'react-router-dom';
import { useProject, useAddMember } from '../hooks/useProjects';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import { Loader } from '../components/Loader';
import { ErrorState } from '../components/ErrorState';
import { useAuthStore } from '../store/auth.store';
import { useState, useMemo, useEffect } from 'react';
import { TaskList } from '../components/TaskList';
import { TaskForm } from '../components/TaskForm';
import { joinProjectRoom, leaveProjectRoom } from '../hooks/useSocket';
import type { Task, CreateTaskDto, UpdateTaskDto } from '../types/task';
import type { ProjectMember } from '../types/project';

export const ProjectDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    // Join Project Room for Real-time Updates
    useEffect(() => {
        if (id) {
            joinProjectRoom(id);
            return () => {
                leaveProjectRoom(id);
            };
        }
    }, [id]);

    // Data Fetching
    const { data: project, isLoading: isProjectLoading, error: projectError } = useProject(id!);
    // Fetch tasks for this project specifically. 
    // Note: API needs to support 'project' filter. 
    // Assuming we passed `{ project: id }` to useTasks.
    const { data: tasks = [], isLoading: isTasksLoading } = useTasks(id ? { projectId: id } : undefined);

    const createTaskMutation = useCreateTask();
    const updateTaskMutation = useUpdateTask();
    const deleteTaskMutation = useDeleteTask();
    const addMemberMutation = useAddMember();

    // UI States
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [newMemberId, setNewMemberId] = useState('');

    // Derived State
    const myMemberInfo = useMemo(() =>
        project?.members.find((m: ProjectMember) => m.user._id === user?._id),
        [project, user]);

    const isManager = user?.role === 'admin' || project?.owner._id === user?._id || myMemberInfo?.role === 'project_manager';

    const handleCreateOrUpdateTask = async (data: CreateTaskDto | UpdateTaskDto, taskId?: string) => {
        try {
            if (taskId || editingTask) {
                await updateTaskMutation.mutateAsync({ id: taskId || editingTask!._id, data });
            } else {
                // Ensure projectId is attached
                await createTaskMutation.mutateAsync({ ...data, projectId: id } as CreateTaskDto);
            }
            setIsTaskModalOpen(false);
            setEditingTask(undefined);
        } catch (error) {
            console.error(error);
            alert('Failed to save task');
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!isManager) return;
        if (confirm('Delete this task?')) {
            await deleteTaskMutation.mutateAsync(taskId);
        }
    };

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMemberId) return;
        addMemberMutation.mutate({ projectId: id!, userId: newMemberId, role: 'project_member' }, {
            onSuccess: () => {
                setIsMemberModalOpen(false);
                setNewMemberId('');
            },
            onError: () => alert('Failed to add member (User ID might be invalid)')
        });
    };

    if (isProjectLoading || isTasksLoading) return <Loader />;

    if (projectError || !project) {
        return <ErrorState message="Project not found" onRetry={() => navigate('/projects')} />;
    }

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[rgb(var(--color-bg))]">
            {/* Header */}
            <header className="shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111418] px-6 py-4 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <button onClick={() => navigate('/projects')} className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                                Projects
                            </button>
                            <span className="text-slate-300">/</span>
                            <span className="text-xs font-mono text-slate-400">ID: {project._id.slice(-4)}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {project.title}
                            <span className={`text-xs px-2 py-1 rounded-full text-white ${isManager ? 'bg-purple-600' : 'bg-slate-500'}`}>
                                {isManager ? 'Manager' : 'Member'}
                            </span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">{project.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        {isManager && (
                            <>
                                <button
                                    onClick={() => setIsMemberModalOpen(true)}
                                    className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-[#1e2736] border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                                    Add Member
                                </button>
                                <button
                                    onClick={() => { setEditingTask(undefined); setIsTaskModalOpen(true); }}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-[20px]">add_task</span>
                                    New Task
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Quick Stats Row */}
                <div className="flex gap-6 text-sm text-slate-500 border-t border-gray-100 dark:border-gray-800 pt-4">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">group</span>
                        <span className="font-medium text-slate-900 dark:text-white">{project.members.length}</span> Members
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">list_alt</span>
                        <span className="font-medium text-slate-900 dark:text-white">{tasks.length}</span> Tasks
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        <span className="font-medium text-slate-900 dark:text-white">{tasks.filter((t: Task) => t.status === 'completed').length}</span> Completed
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                {/* Main Content: Tasks */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Project Tasks</h2>
                            {/* Filter controls can go here */}
                        </div>

                        {tasks.length === 0 ? (
                            <div className="text-center py-12 bg-white dark:bg-[#1e2736] rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                <p className="text-slate-500">No tasks in this project yet.</p>
                                {isManager && (
                                    <button
                                        onClick={() => setIsTaskModalOpen(true)}
                                        className="mt-4 text-blue-600 font-medium hover:underline"
                                    >
                                        Create one now
                                    </button>
                                )}
                            </div>
                        ) : (
                            <TaskList
                                tasks={tasks}
                                onEdit={(task) => { setEditingTask(task); setIsTaskModalOpen(true); }}
                                onDelete={handleDeleteTask}
                                onStatusUpdate={(task, newStatus) => handleCreateOrUpdateTask({
                                    status: (newStatus || (task.status === 'completed' ? 'pending' : 'completed')) as Task['status'],
                                } as UpdateTaskDto, task._id)}
                            />
                        )}
                    </div>
                </div>

                {/* Sidebar: Members */}
                <div className="w-full md:w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111418] overflow-y-auto hidden md:block">
                    <div className="p-6">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Team Members</h3>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3 p-2 rounded-lg bg-purple-50 dark:bg-purple-900/10">
                                <div className="size-8 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center text-purple-700 dark:text-white font-bold text-xs">
                                    {project.owner.username.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm text-slate-900 dark:text-white truncate">{project.owner.username}</div>
                                    <div className="text-xs text-purple-600 dark:text-purple-400">Owner</div>
                                </div>
                            </div>

                            {project.members.map((member: ProjectMember) => (
                                <div key={member.user._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#1e2736] transition-colors">
                                    <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs">
                                        {member.user.username.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm text-slate-900 dark:text-white truncate">{member.user.username}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">{member.role.replace('_', ' ')}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isTaskModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[rgb(var(--color-bg))] rounded-xl shadow-xl w-full max-w-xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                            <h2 className="text-xl font-bold text-[rgb(var(--color-text))]">{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
                        </div>
                        <TaskForm
                            initialData={editingTask}
                            onSubmit={handleCreateOrUpdateTask}
                            onCancel={() => setIsTaskModalOpen(false)}
                            projectId={id} // Pass project ID to filter assignees
                            projectMembers={project.members} // Pass members to populate dropdown
                        />
                    </div>
                </div>
            )}

            {isMemberModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[rgb(var(--color-bg))] rounded-xl shadow-xl w-full max-w-sm border border-gray-200 dark:border-gray-800">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-[rgb(var(--color-text))] mb-4">Add Member</h2>
                            <form onSubmit={handleAddMember} className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">User ID to Add</label>
                                    <input
                                        type="text"
                                        value={newMemberId}
                                        onChange={(e) => setNewMemberId(e.target.value)}
                                        placeholder="Enter user ID..."
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-[#111418] dark:border-gray-600 dark:text-white"
                                        required
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Temporary: Enter a User ID directly.</p>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsMemberModalOpen(false)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
                                    >
                                        Add Member
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
