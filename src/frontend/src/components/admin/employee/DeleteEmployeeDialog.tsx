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
import {Employee} from '@/types/schema';
import {useDeleteEmployee} from '@/api';
import {toast} from 'sonner';

interface DeleteEmployeeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employee: Employee;
    onSuccess?: () => void;
}

const DeleteEmployeeDialog: React.FC<DeleteEmployeeDialogProps> = ({
                                                                       open,
                                                                       onOpenChange,
                                                                       employee,
                                                                       onSuccess,
                                                                   }) => {
    const [deleteEmployee, {loading}] = useDeleteEmployee();

    const handleDelete = async () => {
        try {
            await deleteEmployee({
                variables: {
                    id: employee.id,
                },
            });

            toast.message("Employee deleted", {
                description: `${employee.name} has been removed from the system.`,
            });

            onOpenChange(false);
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Error deleting employee:', error);
            toast.error("Error", {
                description: "There was an error deleting the employee. Please try again.",
            });
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete {employee.name}'s profile and all associated data.
                        This action cannot be undone.
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

export default DeleteEmployeeDialog;