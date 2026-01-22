import { useParams, useNavigate } from 'react-router-dom';
import { useProject, useInviteMember, useRemoveMember, useDeleteProject } from '../hooks/useProjects';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import { Loader } from '../components/Loader';
import { ErrorState } from '../components/ErrorState';
import { useAuthStore } from '../store/auth.store';
import { useState, useMemo, useEffect } from 'react';
import { TaskList } from '../components/TaskList';
import { TaskForm } from '../components/TaskForm';
import { UserSearch } from '../components/UserSearch';
import { useSocketContext } from '../context/useSocketContext';
import { useSidebar } from '../context/useSidebar';
import type { Task, CreateTaskDto, UpdateTaskDto } from '../types/task';
import type { ProjectMember } from '../types/project';
import { useConfirmDialog } from '../context/ConfirmDialogContext';

export const ProjectDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { joinProjectRoom, leaveProjectRoom } = useSocketContext();
    const { confirm } = useConfirmDialog();
    const { toggle } = useSidebar();
    const [showMembersPanel, setShowMembersPanel] = useState(() => window.innerWidth >= 768);

    // useEffect(() => {
    //     // Optional: Add resize listener if we want responsive behavior on resize
    //     const handleResize = () => {
    //         if (window.innerWidth >= 768 && !showMembersPanel) {
    //             // only auto-open, don't auto-close? or keep user preference?
    //             // The original code only checked on mount.
    //             // let's stick to initial value or strict generic resize if desired.
    //             // For now, lazy init covers the "on mount" logic.
    //             // We can leave this empty or remove the effect entirely if we only cared about initial load.
    //         }
    //     };
    //     // window.addEventListener('resize', handleResize);
    //     // return () => window.removeEventListener('resize', handleResize);
    // }, []);

    // Join Project Room for Real-time Updates
    useEffect(() => {
        if (id) {
            joinProjectRoom(id);
            return () => {
                leaveProjectRoom(id);
            };
        }
    }, [id, joinProjectRoom, leaveProjectRoom]);

    // Data Fetching
    const { data: project, isLoading: isProjectLoading, error: projectError } = useProject(id!);
    // Fetch tasks for this project specifically. 
    // Note: API needs to support 'project' filter. 
    // Assuming we passed `{ project: id }` to useTasks.
    const { data: tasks = [], isLoading: isTasksLoading } = useTasks(id ? { projectId: id } : undefined);

    const createTaskMutation = useCreateTask();
    const updateTaskMutation = useUpdateTask();
    const deleteTaskMutation = useDeleteTask();
    const inviteMemberMutation = useInviteMember();
    const removeMemberMutation = useRemoveMember();
    const deleteProjectMutation = useDeleteProject();

    const handleRemoveMember = async (memberId: string, memberName: string) => {
        const confirmed = await confirm({
            title: 'Remove Member',
            message: `Are you sure you want to remove ${memberName} from this project? Their assigned tasks will be unassigned.`,
            confirmText: 'Remove',
            cancelText: 'Cancel',
            variant: 'danger',
        });
        if (confirmed) {
            removeMemberMutation.mutate({ projectId: id!, userId: memberId });
        }
    };

    // UI States
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

    // Derived State
    const myMemberInfo = useMemo(() =>
        project?.members.find((m: ProjectMember) => m.user._id === user?._id),
        [project, user]);

    const isManager = user?.role === 'admin' || project?.owner._id === user?._id || myMemberInfo?.role === 'project_manager';
    const isOwner = project?.owner._id === user?._id;

    const handleDeleteProject = async () => {
        const confirmed = await confirm({
            title: 'Delete Project',
            message: `Are you sure you want to delete "${project?.title}"? This will permanently delete all tasks and data associated with this project.`,
            confirmText: 'Delete Project',
            cancelText: 'Cancel',
            variant: 'danger',
        });
        if (confirmed && id) {
            deleteProjectMutation.mutate(id, {
                onSuccess: () => navigate('/projects')
            });
        }
    };

    const handleCreateOrUpdateTask = async (data: CreateTaskDto | UpdateTaskDto, taskIdOrEvent?: string | unknown) => {
        try {
            const explicitId = typeof taskIdOrEvent === 'string' ? taskIdOrEvent : undefined;
            const idToUpdate = explicitId || editingTask?._id;

            if (idToUpdate) {
                await updateTaskMutation.mutateAsync({ id: idToUpdate, data });
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
        // Permission checked by backend and TaskList button
        const confirmed = await confirm({
            title: 'Delete Task',
            message: 'Are you sure you want to delete this task? This action cannot be undone.',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            variant: 'danger',
        });
        if (confirmed) {
            await deleteTaskMutation.mutateAsync(taskId);
        }
    };


    if (isProjectLoading || isTasksLoading) return <Loader />;

    if (projectError || !project) {
        return <ErrorState message="Project not found" onRetry={() => navigate('/projects')} />;
    }

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[rgb(var(--color-bg))]">
            {/* Header */}
            <header className="shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111418] px-4 md:px-6 py-4 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 mb-1">
                            <button
                                onClick={toggle}
                                className="lg:hidden text-[#637588] dark:text-[#9da8b9] shrink-0"
                            >
                                <span className="material-symbols-outlined">menu</span>
                            </button>
                            <button onClick={() => navigate('/projects')} className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                                <span className="hidden sm:inline">Projects</span>
                            </button>
                            <span className="text-slate-300">/</span>
                            <span className="text-xs font-mono text-slate-400">ID: {project._id.slice(-4)}</span>
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                            {project.title}
                            <span className={`text-xs px-2 py-1 rounded-full text-white ${isManager ? 'bg-purple-600' : 'bg-slate-500'}`}>
                                {isManager ? 'Manager' : 'Member'}
                            </span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-2xl line-clamp-2 md:line-clamp-none">{project.description}</p>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto">
                        {isManager && (
                            <>
                                <button
                                    onClick={() => setIsMemberModalOpen(true)}
                                    className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-[#1e2736] border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                                    <span className="hidden sm:inline">Add Member</span>
                                </button>
                                <button
                                    onClick={() => { setEditingTask(undefined); setIsTaskModalOpen(true); }}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-[20px]">add_task</span>
                                    <span className="hidden sm:inline">New Task</span>
                                </button>
                            </>
                        )}
                        {isOwner && (
                            <button
                                onClick={handleDeleteProject}
                                className="px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-[#1e2736] border border-red-300 dark:border-red-900/50 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                <span className="hidden sm:inline">Delete Project</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Quick Stats Row - Responsive Grid */}
                <div className="grid grid-cols-2 md:flex md:gap-6 gap-4 text-sm text-slate-500 border-t border-gray-100 dark:border-gray-800 pt-4">
                    <button
                        onClick={() => setShowMembersPanel(!showMembersPanel)}
                        className={`flex items-center gap-2 p-2 rounded-lg transition-colors text-left
                        ${showMembersPanel ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' : 'bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800'}
                        `}
                    >
                        <span className="material-symbols-outlined text-[18px]">group</span>
                        <span className="font-medium text-slate-900 dark:text-white">{project.members.length}</span>
                        <span className="text-xs md:text-sm">Members</span>
                        <span className="material-symbols-outlined text-[16px] ml-auto">
                            {showMembersPanel ? 'expand_less' : 'expand_more'}
                        </span>
                    </button>
                    <div className="flex items-center gap-2 p-2 md:p-0 bg-gray-50 md:bg-transparent rounded-lg md:rounded-none">
                        <span className="material-symbols-outlined text-[18px]">list_alt</span>
                        <span className="font-medium text-slate-900 dark:text-white">{tasks.length}</span> <span className="text-xs md:text-sm">Tasks</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 md:p-0 bg-gray-50 md:bg-transparent rounded-lg md:rounded-none col-span-2 md:col-span-1">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        <span className="font-medium text-slate-900 dark:text-white">{tasks.filter((t: Task) => t.status === 'completed').length}</span> <span className="text-xs md:text-sm">Completed</span>
                    </div>
                </div>
            </header >

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                {/* Main Content: Tasks */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
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
                                projects={project ? [project] : []}
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
                <div className={`w-full md:w-80 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111418] overflow-y-auto shrink-0 ${showMembersPanel ? 'block' : 'hidden'}`}>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900 dark:text-white">Team Members</h3>
                            <button
                                onClick={() => setShowMembersPanel(false)}
                                className="md:hidden text-slate-400 hover:text-slate-600"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        {/* Member list content remains... */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3 p-2 rounded-lg bg-purple-50 dark:bg-purple-900/10">
                                <div className="size-8 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center text-purple-700 dark:text-white font-bold text-xs">
                                    {project.owner.username.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm text-slate-900 dark:text-white truncate">{project.owner.username}</div>
                                    <div className="text-xs text-purple-600 dark:text-purple-400">
                                        {project.members.some((m: ProjectMember) => m.user._id === project.owner._id && m.role === 'project_manager')
                                            ? 'Owner, Project Manager'
                                            : 'Owner'}
                                    </div>
                                </div>
                            </div>

                            {project.members
                                .filter((member: ProjectMember) => member.user._id !== project.owner._id)
                                .map((member: ProjectMember) => (
                                    <div key={member.user._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#1e2736] transition-colors group">
                                        <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs">
                                            {member.user.username.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm text-slate-900 dark:text-white truncate">{member.user.username}</div>
                                            <div className={`text-xs capitalize ${member.role === 'project_manager' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                                {member.role === 'project_manager' ? 'Project Manager' : 'Team Member'}
                                            </div>
                                        </div>
                                        {isManager && (
                                            <button
                                                onClick={() => handleRemoveMember(member.user._id, member.user.username)}
                                                className="opacity-100 md:opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                                                title="Remove member"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">person_remove</span>
                                            </button>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {
                isTaskModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-white dark:bg-[#1e2736] rounded-xl shadow-xl w-full max-w-xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
                            </div>
                            <TaskForm
                                initialData={editingTask}
                                onSubmit={handleCreateOrUpdateTask}
                                onCancel={() => setIsTaskModalOpen(false)}
                                projectId={id}
                                projectMembers={project.members}
                                canAssign={isManager}
                            />
                        </div>
                    </div>
                )
            }

            {
                isMemberModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-white dark:bg-[#1e2736] rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Invite Member</h2>
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Search User</label>
                                        <UserSearch
                                            onSelect={async (user) => {
                                                const confirmed = await confirm({
                                                    title: 'Invite Member',
                                                    message: `Invite ${user.username} to this project?`,
                                                    confirmText: 'Send Invite',
                                                    cancelText: 'Cancel',
                                                    variant: 'info',
                                                });
                                                if (confirmed) {
                                                    inviteMemberMutation.mutate({ projectId: id!, email: user.email });
                                                    // Don't close immediately if we want to allow multiple invites, 
                                                    // but for now let's keep it simple or maybe just clear selection inside search
                                                    // Recent change in UserSearch doesn't clear onSelect, but the card button suggests action.
                                                    // Let's close modal for now to be safe.
                                                    setIsMemberModalOpen(false);
                                                }
                                            }}
                                            placeholder="Search by email address..."
                                        />
                                        <p className="text-xs text-slate-500 mt-2">Select a user to immediately send an invitation.</p>
                                    </div>
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsMemberModalOpen(false)}
                                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};
