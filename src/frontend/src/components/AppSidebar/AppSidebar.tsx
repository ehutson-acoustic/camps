import {useMemo, useEffect, useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {Activity, ChevronDown, ChevronRight, Settings} from 'lucide-react';
import {useGetEmployees, useGetTeams} from '@/api';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible.tsx";
import {Employee} from "@/types/schema.ts";

const AppSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {data: employeesData} = useGetEmployees();
    const {data: teamsData} = useGetTeams();

    // Track which teams are open
    const [openTeams, setOpenTeams] = useState<Record<string, boolean>>({});

    // Initialize open state base on the current route
    useEffect(() => {
        // Load the saved state from localStorage
        try {
            const saved = localStorage.getItem('openTeams');
            if (saved) {
                setOpenTeams(JSON.parse(saved));
            }
        } catch (e) {
            console.error('Error loading saved sidebar state', e);
        }

        // Auto-expand the team if viewing an employee from that team
        if (location.pathname.startsWith('/employee') && employeesData?.employees) {
            const employeeId = location.pathname.split('/').pop();
            const employee = employeesData.employees.find(emp => emp.id === employeeId);
            if (employee?.team) {
                setOpenTeams(prev => ({...prev, [String(employee.team?.id)]: true}));
            }
        }
    }, [location.pathname, employeesData?.employees]);

    // Save the open state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('openTeams', JSON.stringify(openTeams));
    }, [openTeams]);

    // Group the employees by team
    const employeesByTeam = useMemo(() => {
        const grouped: Record<string, Array<Employee>> = {};

        if (employeesData?.employees) {
            employeesData.employees.forEach(employee => {
                if (employee.team) {
                    if (!grouped[employee.team.id]) {
                        grouped[employee.team.id] = [];
                    }
                    grouped[employee.team.id].push(employee);
                }
            });

            // Sort employees alphabetically within each team
            Object.keys(grouped).forEach(teamId => {
                grouped[teamId].sort((a, b) => a.name.localeCompare(b.name));
            });
        }
        return grouped;
    }, [employeesData?.employees]);

    // Path matching helpers
    const isTeamActive = (teamId: string) => location.pathname === `/team/${teamId}`;
    const isEmployeeActive = (employeeId: string) => location.pathname === `/employee/${employeeId}`;

    // Handle the team click - navigate to the team dashboard
    const handleTeamClick = (teamId: string) => {
        navigate(`/team/${teamId}`);
    };

    // Handle the team open state change
    const handleOpenChange = (teamId: string, isOpen: boolean) => {
        setOpenTeams(prev => ({
            ...prev,
            [teamId]: isOpen
        }));
    };

    return (
        <Sidebar>
            <SidebarHeader className="p-4">
                <div className="flex items-center gap-2">
                    <Activity className="h-6 w-6 text-primary"/>
                    <h2 className="text-xl font-semibold">CAMPS Tracker</h2>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarMenu>
                    {teamsData?.teams?.map(team => (
                        <Collapsible
                            key={team.id}
                            open={openTeams[team.id]}
                            onOpenChange={(isOpen) => handleOpenChange(team.id, isOpen)}
                            className="w-full"
                        >
                            <SidebarMenuItem>
                                <div className="flex items-center w-full">
                                    <SidebarMenuButton
                                        onClick={() => handleTeamClick(team.id)}
                                        isActive={isTeamActive(team.id)}
                                        className="flex-1"
                                    >
                                        {team.name}
                                    </SidebarMenuButton>

                                    <CollapsibleTrigger asChild>
                                        <button className="h-6 w-6 p-0 flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
                                            {openTeams[team.id] ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                        </button>
                                    </CollapsibleTrigger>
                                </div>

                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {employeesByTeam[team.id]?.map(employee => (
                                            <SidebarMenuSubItem key={employee.id}>
                                                <Link
                                                    to={`/employee/${employee.id}`}
                                                    className={`w-full px-2 py-1.5 rounded-md text-sm ${
                                                        isEmployeeActive(employee.id)
                                                            ? 'bg-accent text-accent-foreground font-medium'
                                                            : 'hover:bg-accent/50 hover:text-accent-foreground'
                                                    }`}
                                                >
                                                    {employee.name}
                                                </Link>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    ))}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="p-4">
                <SidebarSeparator className="mb-4">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link to="/admin" className="flex items-center gap-2">
                                    <Settings className="h-4 w-4"/>
                                    <span>Admin Dashboard</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarSeparator>
            </SidebarFooter>
        </Sidebar>
    );
};

export default AppSidebar;