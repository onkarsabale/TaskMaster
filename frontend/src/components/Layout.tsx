import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

import { SidebarProvider } from '../context/SidebarProvider';

export const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <SidebarProvider>
            <div className="flex h-screen w-full bg-[#f6f7f8] dark:bg-[#101822] text-slate-900 dark:text-white font-display overflow-hidden selection:bg-[rgb(var(--color-primary))] selection:text-white">
                <Sidebar />
                <div className="flex-1 relative flex flex-col min-w-0 h-full overflow-hidden">
                    {children}
                </div>
            </div>
        </SidebarProvider>
    );
};
