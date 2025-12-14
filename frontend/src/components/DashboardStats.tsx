
interface DashboardStatsProps {
    openTasks: number;
    dueToday: number;
    overdue: number;
    completed: number;
}

export const DashboardStats = ({ openTasks, dueToday, overdue, completed }: DashboardStatsProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stat Card 1 */}
            <div className="bg-white dark:bg-[#1e2736] border border-gray-200 dark:border-gray-700 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <span className="material-symbols-outlined text-blue-500">assignment</span>
                    </div>
                    <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">+2%</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Open Tasks</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{openTasks}</p>
            </div>
            {/* Stat Card 2 */}
            <div className="bg-white dark:bg-[#1e2736] border border-gray-200 dark:border-gray-700 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                        <span className="material-symbols-outlined text-purple-500">calendar_today</span>
                    </div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-gray-500/10 px-2 py-0.5 rounded-full">0%</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Due Today</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{dueToday}</p>
            </div>
            {/* Stat Card 3 */}
            <div className="bg-white dark:bg-[#1e2736] border border-gray-200 dark:border-gray-700 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow group cursor-pointer ring-1 ring-transparent hover:ring-red-500/50">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                        <span className="material-symbols-outlined text-red-500">warning</span>
                    </div>
                    <span className="text-xs font-medium text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">+5%</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium group-hover:text-red-500 transition-colors">Overdue</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{overdue}</p>
            </div>
            {/* Stat Card 4 */}
            <div className="bg-white dark:bg-[#1e2736] border border-gray-200 dark:border-gray-700 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                        <span className="material-symbols-outlined text-green-500">check_circle</span>
                    </div>
                    <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">+15%</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{completed}</p>
            </div>
        </div>
    );
};
