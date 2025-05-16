import React from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {Team} from '@/types/schema';
import {useCreateTeam, useUpdateTeam} from '@/api';
import {toast} from 'sonner';

// Form schema definition
const teamFormSchema = z.object({
    name: z.string().min(1, {message: "Team name is required"}),
    description: z.string().optional(),
});

type FormValues = z.infer<typeof teamFormSchema>;

interface TeamFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    team?: Team; // For editing mode
    onSuccess?: () => void;
}

const TeamFormDialog: React.FC<TeamFormDialogProps> = ({
                                                           open,
                                                           onOpenChange,
                                                           team,
                                                           onSuccess,
                                                       }) => {
    const isEditing = !!team;

    // Initialize form with default values or existing team data
    const form = useForm<FormValues>({
        resolver: zodResolver(teamFormSchema),
        defaultValues: {
            name: team?.name ?? '',
            description: team?.description ?? '',
        },
    });

    // Mutations for creating/updating teams
    const [createTeam, {loading: createLoading}] = useCreateTeam();
    const [updateTeam, {loading: updateLoading}] = useUpdateTeam();

    const isLoading = createLoading || updateLoading;

    // Handle form submission
    const onSubmit = async (data: FormValues) => {
        try {
            // Prepare the input data
            const teamInput = {
                name: data.name,
                description: data.description ?? '',
            };

            if (isEditing && team) {
                // Update existing team
                await updateTeam({
                    variables: {
                        id: team.id,
                        input: teamInput,
                    },
                });

                toast.message("Team updated", {
                    description: `${data.name} has been updated successfully.`,
                });
            } else {
                // Create a new team
                await createTeam({
                    variables: {
                        input: teamInput,
                    },
                });

                toast.message("Team created", {
                    description: `${data.name} has been created successfully.`,
                });
            }

            // Close dialog and refresh data
            onOpenChange(false);
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Error saving team:', error);
            toast.error("Error", {
                description: `There was an error ${isEditing ? 'updating' : 'creating'} the team. Please try again.`,
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit' : 'Add'} Team
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update team information in the system.'
                            : 'Add a new team to the system.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Team Name*</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter team name" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        The name of the team
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter team description"
                                            {...field}
                                            value={field.value ?? ''}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Describe the team's purpose or function
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : isEditing ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default TeamFormDialog;