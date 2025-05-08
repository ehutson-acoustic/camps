import React from 'react';
import {SidebarInset, SidebarProvider, SidebarTrigger} from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import {Separator} from '@/components/ui/separator';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({children}) => {
    return (
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
                    <SidebarTrigger className="-ml-1"/>
                    <Separator orientation="vertical" className="h-4"/>
                    <h1 className="font-semibold">CAMPS Employee Engagement Tracker</h1>
                </header>
                <div className="p-6">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default DashboardLayout;