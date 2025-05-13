import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {format} from 'date-fns';
import {ActionStatus, CampsCategory} from '@/types/schema';
import {useCreateActionItem, useUpdateActionItem} from '@/api';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from '@/components/ui/form';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {Calendar} from '@/components/ui/calendar';
import {Popover, PopoverContent, PopoverTrigger,} from '@/components/ui/popover';
import {toast} from 'sonner';
import {CalendarIcon} from 'lucide-react';
import {cn} from '@/lib/utils';
import {OffsetDateTime} from "@js-joda/core";
import {CAMPS_CATEGORIES} from "@/lib/CampsCategories.ts";

// Action Status info
const ACTION_STATUSES = [
    {value: ActionStatus.PLANNED, label: 'Planned'},
    {value: ActionStatus.IN_PROGRESS, label: 'In Progress'},
    {value: ActionStatus.COMPLETED, label: 'Completed'},
    {value: ActionStatus.CANCELLED, label: 'Cancelled'},
];

// Form schema definition
const formSchema = z.object({
    description: z.string().min(1, 'Description is required'),
    category: z.nativeEnum(CampsCategory).optional(),
    dueDate: z.date().optional(),
    status: z.nativeEnum(ActionStatus),
    outcome: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ActionItemFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employeeId: string;
    existingItem?: {
        id: string;
        description: string;
        category?: CampsCategory | null;
        dueDate?: string | null;
        status: ActionStatus;
        outcome?: string | null;
    };
    onSuccess?: () => void;
}

const ActionItemForm = ({
                            open,
                            onOpenChange,
                            employeeId,
                            existingItem,
                            onSuccess,
                        }: ActionItemFormProps) => {
    const isEditing = !!existingItem;

    console.log("Existing item:", existingItem);

    // Initialize the form
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: existingItem?.description ?? '',
            category: existingItem?.category ?? undefined,
            dueDate: existingItem?.dueDate
                ? new Date(existingItem.dueDate)
                : undefined,
            status: existingItem?.status ?? ActionStatus.PLANNED,
            outcome: existingItem?.outcome ?? '',
        },
    });

    // Watch the status field to conditionally show the outcome field
    const watchStatus = form.watch('status');
    const showOutcome = watchStatus === ActionStatus.COMPLETED || watchStatus === ActionStatus.CANCELLED;

    // Mutations for creating/updating action items
    const [createActionItem, {loading: createLoading}] = useCreateActionItem();
    const [updateActionItem, {loading: updateLoading}] = useUpdateActionItem();

    const isLoading = createLoading || updateLoading;

    // Handle form submission
    const onSubmit = async (data: FormValues) => {
        try {
            if (isEditing && existingItem) {
                // Update existing action item
                await updateActionItem({
                    variables: {
                        id: existingItem.id,
                        input: {
                            employeeId,
                            description: data.description,
                            category: data.category,
                            createdDate: OffsetDateTime.now().toString(),
                            //dueDate: data.dueDate ? format(data.dueDate, 'yyyy-MM-dd') : null,
                            dueDate: data.dueDate ? OffsetDateTime.parse(data.dueDate.toISOString()).toString() : null,
                            status: data.status,
                        },
                    },
                });

                toast.message("Action Item updated", {
                    description: "The action item has been updated successfully.",
                });
            } else {
                // Create a new action item
                await createActionItem({
                    variables: {
                        input: {
                            employeeId,
                            description: data.description,
                            category: data.category,
                            createdDate: OffsetDateTime.now().toString(),
                            dueDate: data.dueDate ? OffsetDateTime.parse(data.dueDate.toISOString()).toString() : null,
                            status: data.status,
                        },
                    },
                });

                toast.message("Action Item created", {
                    description: "A new action item has been created successfully.",
                });
            }

            // Close dialog and refresh data
            onOpenChange(false);
            if (onSuccess) {
                onSuccess();
            } else {
                // Only close the dialog if there's no onSuccess handler
                onOpenChange(false);
            }
        } catch (error) {
            console.error('Error saving action item:', error);
            toast.error("Error", {
                description: "There was an error saving the action item. Please try again.",
            });
        }
    };

    function getSaveButtonText() {
        if (isLoading) {
            return 'Saving...';
        }
        return isEditing ? 'Update' : 'Create';
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit' : 'Add'} Action Item
                    </DialogTitle>
                    <DialogDescription>
                        Create a task to improve employee engagement
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="description"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="What needs to be done?"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Describe the action item in detail
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="category"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>CAMPS Category</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a category"/>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.entries(CAMPS_CATEGORIES).map(([value, {name}]) => (
                                                    <SelectItem key={value} value={value}>
                                                        {name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            The CAMPS category this action item addresses
                                        </FormDescription>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({field}) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Due Date</FormLabel>
                                        <Popover modal>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            //field.value.toString()
                                                            //OffsetDateTime.parse(field.value.toISOString()).format(DateTimeFormatter.ofPattern("PPP"))
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={(date) => {
                                                        console.log("Selected date:", JSON.stringify(date, null, 2));
                                                        field.onChange(date);
                                                        // Close the popover after selecting a date
                                                        open = false;
                                                    }}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormDescription>
                                            Optional: When this action should be completed
                                        </FormDescription>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="status"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a status"/>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {ACTION_STATUSES.map(({value, label}) => (
                                                <SelectItem key={value} value={value}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Current status of this action item
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        {showOutcome && (
                            <FormField
                                control={form.control}
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
                        )}

                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {getSaveButtonText()}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default ActionItemForm;