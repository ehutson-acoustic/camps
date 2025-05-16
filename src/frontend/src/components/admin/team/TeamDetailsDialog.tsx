import React from 'react';
import {useGetTeam} from '@/api';
import {Employee} from '@/types/schema';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {Users} from 'lucide-react';
import {Separator} from '@/components/ui/separator';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';

interface TeamDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    teamId: string;
}

const TeamDetailsDialog: React.FC<TeamDetailsDialogProps> = ({
                                                                 open,
                                                                 onOpenChange,
                                                                 teamId,
                                                             }) => {
    // Fetch team data
    const {data, loading, error} = useGetTeam({
        variables: {teamId},
        skip: !teamId,
    });

    const team = data?.team;

    // Get initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-48">
                    <p className="text-muted-foreground">Loading team data...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex justify-center items-center h-48">
                    <p className="text-destructive">Error loading team data: {error.message}</p>
                </div>
            );
        }

        if (!team) {
            return (
                <div className="flex justify-center items-center h-48">
                    <p className="text-muted-foreground">Team not found</p>
                </div>
            );
        }

        return (
            <>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 text-lg">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                                {getInitials(team.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-2xl font-bold">{team.name}</h2>
                            {team.description && (
                                <p className="text-muted-foreground mt-1">{team.description}</p>
                            )}
                        </div>
                    </div>

                    <Separator/>

                    <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <Users className="h-5 w-5"/>
                            Team Members
                        </h3>

                        {team.members && team.members.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Position</TableHead>
                                        <TableHead>Department</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {team.members.map((member: Employee) => (
                                        <TableRow key={member.id}>
                                            <TableCell className="font-medium">{member.name}</TableCell>
                                            <TableCell>{member.position || '-'}</TableCell>
                                            <TableCell>{member.department || '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-muted-foreground text-center py-4">No team members found</p>
                        )}
                    </div>
                </div>
            </>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px]">
                <DialogHeader>
                    <DialogTitle>Team Details</DialogTitle>
                    <DialogDescription>
                        View detailed information about this team
                    </DialogDescription>
                </DialogHeader>

                {renderContent()}

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default TeamDetailsDialog;