import React, {useState} from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {useGetTeams} from '@/api';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {Building2, Eye, MoreHorizontal, PencilIcon, Plus, Search, Trash2, Users, X} from 'lucide-react';
import {Team} from '@/types/schema';
import {DeleteTeamDialog, TeamDetailsDialog, TeamFormDialog} from '@/components/admin';

const TeamAdmin: React.FC = () => {
    // State for search
    const [searchQuery, setSearchQuery] = useState('');

    // State for dialogs
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

    // Fetch teams data
    const {
        data: teamsData,
        loading: teamsLoading,
        refetch: refetchTeams
    } = useGetTeams();

    // Filter teams based on search query
    const filteredTeams = React.useMemo(() => {
        if (!teamsData?.teams) return [];

        return teamsData.teams.filter(team => {
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    team.name.toLowerCase().includes(query) ||
                    (team.description?.toLowerCase().includes(query) || false)
                );
            }
            return true;
        });
    }, [teamsData?.teams, searchQuery]);

    // Handle creating a new team
    const handleCreateTeam = () => {
        setSelectedTeam(null);
        setFormDialogOpen(true);
    };

    // Handle editing a team
    const handleEditTeam = (team: Team) => {
        setSelectedTeam(team);
        setFormDialogOpen(true);
    };

    // Handle viewing team details
    const handleViewTeam = (team: Team) => {
        setSelectedTeam(team);
        setDetailsDialogOpen(true);
    };

    // Handle deleting a team
    const handleDeleteTeam = (team: Team) => {
        setSelectedTeam(team);
        setDeleteDialogOpen(true);
    };

    // Refresh data after successful operations
    const handleOperationSuccess = () => {
        refetchTeams();
    };

    // Clear search
    const clearSearch = () => {
        setSearchQuery('');
    };

    // Render team table
    const renderTeamTable = () => {
        if (teamsLoading) {
            return (
                <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Loading team data...</p>
                </div>
            );
        }

        if (filteredTeams.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-64">
                    <p className="text-muted-foreground">
                        No teams found{searchQuery ? ' matching your search' : ''}.
                    </p>
                    {searchQuery && (
                        <Button variant="link" onClick={clearSearch} className="mt-2">
                            Clear Search
                        </Button>
                    )}
                </div>
            );
        }

        return (
            <div className="relative w-full overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Members</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTeams.map((team) => (
                            <TableRow key={team.id}>
                                <TableCell className="font-medium">{team.name}</TableCell>
                                <TableCell className="max-w-[300px] truncate">
                                    {team.description ?? '-'}
                                </TableCell>
                                <TableCell>
                                    {team.members ? (
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4 text-muted-foreground"/>
                                            <span>{team.members.length}</span>
                                        </div>
                                    ) : '-'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu modal={false}>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4"/>
                                                <span className="sr-only">Actions</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() => handleViewTeam(team)}>
                                                <Eye className="mr-2 h-4 w-4"/>
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleEditTeam(team)}>
                                                <PencilIcon className="mr-2 h-4 w-4"/>
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator/>
                                            <DropdownMenuItem
                                                onClick={() => handleDeleteTeam(team)}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4"/>
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    };

    return (
        <AdminLayout>
            <div className="space-y-4">
                {/* Header with title and actions */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold flex items-center">
                        <Building2 className="mr-2 h-6 w-6"/>
                        Team Management
                    </h1>

                    <Button onClick={handleCreateTeam}>
                        <Plus className="h-4 w-4 mr-2"/>
                        Add Team
                    </Button>
                </div>

                {/* Search box */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>Search</CardTitle>
                        <CardDescription>Search teams by name or description</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                            <Input
                                placeholder="Search teams..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-9 w-9"
                                    onClick={clearSearch}
                                >
                                    <X className="h-4 w-4"/>
                                    <span className="sr-only">Clear search</span>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Teams table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Team List</CardTitle>
                        <CardDescription>
                            Showing {filteredTeams.length} {filteredTeams.length === 1 ? 'team' : 'teams'}
                            {searchQuery && ' matching your search'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {renderTeamTable()}
                    </CardContent>
                </Card>
            </div>

            {/* Team Form Dialog */}
            {formDialogOpen && (
                <TeamFormDialog
                    open={formDialogOpen}
                    onOpenChange={setFormDialogOpen}
                    team={selectedTeam || undefined}
                    onSuccess={handleOperationSuccess}
                />
            )}

            {/* Delete Confirmation Dialog */}
            {deleteDialogOpen && selectedTeam && (
                <DeleteTeamDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    team={selectedTeam}
                    onSuccess={handleOperationSuccess}
                />
            )}

            {/* Team Details Dialog */}
            {detailsDialogOpen && selectedTeam && (
                <TeamDetailsDialog
                    open={detailsDialogOpen}
                    onOpenChange={setDetailsDialogOpen}
                    teamId={selectedTeam.id}
                />
            )}
        </AdminLayout>
    );
};

export default TeamAdmin;