import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {Team} from '@/types/schema';
import {useDeleteTeam} from '@/api';
import {toast} from 'sonner';

interface DeleteTeamDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    team: Team;
    onSuccess?: () => void;
}

const DeleteTeamDialog: React.FC<DeleteTeamDialogProps> = ({
                                                               open,
                                                               onOpenChange,
                                                               team,
                                                               onSuccess,
                                                           }) => {
    const [deleteTeam, {loading}] = useDeleteTeam();

    const handleDelete = async () => {
        try {
            await deleteTeam({
                variables: {
                    id: team.id,
                },
            });

            toast.message("Team deleted", {
                description: `${team.name} has been removed from the system.`,
            });

            onOpenChange(false);
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Error deleting team:', error);
            toast.error("Error", {
                description: "There was an error deleting the team. This may happen if the team still has employees.",
            });
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the team "{team.name}".
                        This action cannot be undone and may affect employee assignments.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={loading}
                    >
                        {loading ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteTeamDialog;