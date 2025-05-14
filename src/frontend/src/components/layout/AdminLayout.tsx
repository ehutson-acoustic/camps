import React from 'react';
import {Link, useLocation} from 'react-router-dom';
import {
    SidebarGroupLabel,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarSeparator,
    SidebarTrigger
} from '@/components/ui/sidebar';
import {Separator} from '@/components/ui/separator';
import {Building2, Home, Settings, UserRound} from 'lucide-react';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({children}) => {
    const location = useLocation();

    // Check if the current path matches the menu item
    const isActive = (path: string) => {
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    return (
        <SidebarProvider>
            <div className="flex min-h-screen">
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
                        <SidebarTrigger className="-ml-1"/>
                        <Separator orientation="vertical" className="h-4"/>
                        <h1 className="font-semibold flex items-center">
                            <Settings className="h-5 w-5 mr-2"/>
                            CAMPS Admin
                        </h1>
                    </header>
                    <div className="flex flex-1 overflow-hidden">
                        {/* Sidebar */}
                        <div className="hidden md:block w-64 border-r">
                            <div className="flex flex-col h-full p-4">
                                <SidebarGroupLabel className="mb-2">Admin Navigation</SidebarGroupLabel>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive('/admin')}
                                        >
                                            <Link to="/admin">
                                                <Home className="h-4 w-4"/>
                                                <span>Dashboard</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive('/admin/employees')}
                                        >
                                            <Link to="/admin/employees">
                                                <UserRound className="h-4 w-4"/>
                                                <span>Employees</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive('/admin/teams')}
                                        >
                                            <Link to="/admin/teams">
                                                <Building2 className="h-4 w-4"/>
                                                <span>Teams</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                                <SidebarSeparator className="my-4"/>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild>
                                            <Link to="/" className="text-primary">
                                                <Home className="h-4 w-4"/>
                                                <span>Return to App</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </div>
                        </div>

                        {/* Main content */}
                        <div className="flex-1 overflow-auto p-6">
                            {children}
                        </div>
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
};

export default AdminLayout;