import {Users} from 'lucide-react';
import {SidebarMenu, SidebarMenuButton, SidebarMenuItem} from '@/components/ui/sidebar';
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {Employee} from "@/types/schema.ts";
import {Link} from "react-router-dom";

export const TeamLoadingSkeleton = () => (
    <div className="flex items-center space-x-4">
        <Skeleton className="h-4 w-[250px]"/>
        <Skeleton className="h-4 w-[200px]"/>
    </div>
);

export const TeamLoadingError = ({message}: { message: string }) => (
    <div className="text-sm text-destructive px-2 py-1.5">
        Error loading teams: {message}
    </div>
);

export const TeamMembersList = ({employees}: { employees: Employee[] }) => (
    <SidebarMenu>
        {employees.map(employee => (
            <SidebarMenuItem key={employee.id}>
                <SidebarMenuButton asChild>
                    <Link to={`/employee/${employee.id}`}>
                        <Users className="h-4 w-4"/>
                        <span>{employee.name}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        ))}
    </SidebarMenu>
);

export const EmptyStateMessage = ({selectedTeamId}: { selectedTeamId: string }) => (
    <div className="text-sm text-muted-foreground px-2 py-1.5">
        {selectedTeamId ? 'No employees found in this team.' : 'Select a team.'}
    </div>
);