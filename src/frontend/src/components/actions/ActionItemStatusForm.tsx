import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {format} from 'date-fns';
import {useCancelActionItem, useCompleteActionItem} from '@/api';

// Import shadcn components
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from '@/components/ui/form';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {toast} from 'sonner';

// Form schema definition for completing an action item
const completeFormSchema = z.object({
    outcome: z.string().optional(),
    ratingImpact: z.number().min(0).max(10).optional(),
});

// Form schema definition for canceling an action item
const cancelFormSchema = z.object({
    reason: z.string().min(1, 'Reason is required'),
});

type CompleteFormValues = z.infer<typeof completeFormSchema>;
type CancelFormValues = z.infer<typeof cancelFormSchema>;

type ActionItemStatusFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    actionItemId: string;
    actionType: 'complete' | 'cancel';
    onSuccess?: () => void;
};

const ActionItemStatusForm = ({
                                  open,
                                  onOpenChange,
                                  actionItemId,
                                  actionType,
                                  onSuccess,
                              }: ActionItemStatusFormProps) => {
    // Initialize the form based on the action type
    const completeForm = useForm<CompleteFormValues>({
        resolver: zodResolver(completeFormSchema),
        defaultValues: {
            outcome: '',
            ratingImpact: undefined,
        },
    });

    const cancelForm = useForm<CancelFormValues>({
        resolver: zodResolver(cancelFormSchema),
        defaultValues: {
            reason: '',
        },
    });

    // Mutations for completing/canceling action items
    const [completeActionItem, {loading: completeLoading}] = useCompleteActionItem();
    const [cancelActionItem, {loading: cancelLoading}] = useCancelActionItem();

    const isLoading = completeLoading || cancelLoading;

    // Handle complete form submission
    const onSubmitComplete = async (data: CompleteFormValues) => {
        try {
            await completeActionItem({
                variables: {
                    id: actionItemId,
                    completedDate: format(new Date(), 'yyyy-MM-dd'),
                    outcome: data.outcome ?? undefined,
                    ratingImpact: data.ratingImpact ?? undefined,
                },
            });

            toast.message("Action Item Completed", {
                description: 'The action item has been marked as completed.',
            });

            // Close dialog and refresh data
            onOpenChange(false);
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Error completing action item:', error);
            toast.error("Error", {
                description: 'There was an error completing the action item. Please try again.'
            });
        }
    };

    // Handle cancel form submission
    const onSubmitCancel = async (data: CancelFormValues) => {
        try {
            await cancelActionItem({
                variables: {
                    id: actionItemId,
                    reason: data.reason,
                },
            });

            toast.message('Action Item Cancelled', {
                description: 'The action item has been cancelled.',
            });

            // Close dialog and refresh data
            onOpenChange(false);
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Error canceling action item:', error);
            toast.error('Error', {
                description: 'There was an error cancelling the action item. Please try again.',
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {actionType === 'complete' ? 'Complete' : 'Cancel'} Action Item
                    </DialogTitle>
                    <DialogDescription>
                        {actionType === 'complete'
                            ? 'Mark this action item as completed and record the outcome'
                            : 'Cancel this action item and provide a reason'}
                    </DialogDescription>
                </DialogHeader>

                {actionType === 'complete' ? (
                    <Form {...completeForm}>
                        <form onSubmit={completeForm.handleSubmit(onSubmitComplete)} className="space-y-6">
                            <FormField
                                control={completeForm.control}
                                name="outcome"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Outcome</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="What was the result of this action?"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Describe what happened as a result of this action
                                        </FormDescription>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={completeForm.control}
                                name="ratingImpact"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Rating Impact (0-10)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={10}
                                                placeholder="0"
                                                value={field.value ?? ''}
                                                onChange={(e) => {
                                                    const value = e.target.value === ''
                                                        ? undefined
                                                        : Number(e.target.value);
                                                    field.onChange(value);
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Optional: Estimated impact on employee's engagement rating
                                        </FormDescription>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Saving...' : 'Complete Action Item'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                ) : (
                    <Form {...cancelForm}>
                        <form onSubmit={cancelForm.handleSubmit(onSubmitCancel)} className="space-y-6">
                            <FormField
                                control={cancelForm.control}
                                name="reason"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Reason for Cancellation</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Why is this action item being cancelled?"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Explain why this action item is no longer needed or relevant
                                        </FormDescription>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                                    Back
                                </Button>
                                <Button type="submit" variant="destructive" disabled={isLoading}>
                                    {isLoading ? 'Saving...' : 'Cancel Action Item'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default ActionItemStatusForm;