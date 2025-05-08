import {useMemo} from 'react';
import {useLocation} from 'react-router-dom';
import {Activity} from 'lucide-react';
import {useGetEmployees, useGetTeams} from '@/api';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
} from '@/components/ui/sidebar';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {useTeamSelection} from './useTeamSelection';
import {EmptyStateMessage, TeamLoadingError, TeamLoadingSkeleton, TeamMembersList} from './TeamComponents';

const AppSidebar = () => {
    const location = useLocation();
    const {
        data: employeesData,
        loading: employeesLoading,
        error: employeesError
    } = useGetEmployees();
    const {
        data: teamsData,
        loading: teamsLoading
    } = useGetTeams();

    // Extract teams array
    const teams = useMemo(() => {
        if (!teamsData?.teams) return [];
        console.log('teamsData', teamsData);
        return [...teamsData.teams].sort((a, b) => a.name.localeCompare(b.name));
    }, [teamsData?.teams]);

    // Use our custom hook to handle team selection logic
    const {
        selectedTeamId,
        selectedTeam,
        teamEmployees,
        handleTeamChange
    } = useTeamSelection(teams, employeesData, location);

    const isLoading = employeesLoading || teamsLoading;

    // Render the content based on loading state, errors, and data
    const renderTeamContent = () => {
        if (isLoading) return <TeamLoadingSkeleton/>;
        if (employeesError) return <TeamLoadingError message={employeesError.message}/>;
        if (teamEmployees.length > 0) return <TeamMembersList employees={teamEmployees}/>;
        return <EmptyStateMessage selectedTeamId={selectedTeamId}/>;
    };

    return (
        <Sidebar>
            <SidebarHeader className="p-4">
                <div className="flex items-center gap-2">
                    <Activity className="h-6 w-6 text-primary"/>
                    <h2 className="text-xl font-semibold">CAMPS Tracker</h2>
                </div>
                <div className="mt-4">
                    <Select
                        value={selectedTeamId}
                        onValueChange={handleTeamChange}
                        disabled={isLoading || teams.length === 0}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a team"/>
                        </SelectTrigger>
                        <SelectContent>
                            {teams.map(team => (
                                <SelectItem key={team.id} value={team.id}>
                                    {team.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        {selectedTeam ? `${selectedTeam.name} Members` : 'Team Members'}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        {renderTeamContent()}
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
};

export default AppSidebar;