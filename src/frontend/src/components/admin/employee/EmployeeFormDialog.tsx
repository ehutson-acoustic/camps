import React from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {format} from 'date-fns';

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
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Popover, PopoverContent, PopoverTrigger,} from '@/components/ui/popover';
import {Calendar} from '@/components/ui/calendar';
import {CalendarIcon} from 'lucide-react';
import {cn} from '@/lib/utils';
import {Employee, Team} from '@/types/schema';
import {useCreateEmployee, useUpdateEmployee} from '@/api';
import {toast} from 'sonner';
import {OffsetDateTime} from '@js-joda/core';

// Form schema definition
const employeeFormSchema = z.object({
    name: z.string().min(1, {message: "Name is required"}),
    position: z.string().optional(),
    teamId: z.string().optional(),
    department: z.string().optional(),
    startDate: z.date().optional(),
    managerId: z.string().optional(),
});

type FormValues = z.infer<typeof employeeFormSchema>;

interface EmployeeFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employee?: Employee; // For editing mode
    teams: Team[];
    managers: Employee[]; // Potential managers
    onSuccess?: () => void;
}

const EmployeeFormDialog: React.FC<EmployeeFormDialogProps> = ({
                                                                   open,
                                                                   onOpenChange,
                                                                   employee,
                                                                   teams,
                                                                   managers,
                                                                   onSuccess,
                                                               }) => {
    const isEditing = !!employee;

    // Initialize form with default values or existing employee data
    const form = useForm<FormValues>({
        resolver: zodResolver(employeeFormSchema),
        defaultValues: {
            name: employee?.name ?? '',
            position: employee?.position ?? '',
            teamId: employee?.team?.id ?? '',
            department: employee?.department ?? '',
            startDate: employee?.startDate ? new Date(employee.startDate) : undefined,
            managerId: employee?.manager?.id ?? '',
        },
    });

    // Mutations for creating/updating employees
    const [createEmployee, {loading: createLoading}] = useCreateEmployee();
    const [updateEmployee, {loading: updateLoading}] = useUpdateEmployee();

    const isLoading = createLoading || updateLoading;

    // Handle form submission
    const onSubmit = async (data: FormValues) => {
        try {
            // Prepare the input data
            const employeeInput = {
                name: data.name,
                position: data.position ?? null,
                teamId: data.teamId ?? null,
                department: data.department ?? null,
                startDate: data.startDate ? OffsetDateTime.parse(data.startDate.toISOString()).toString() : null,
                managerId: data.managerId ?? null,
            };

            if (isEditing) {
                // Update existing employee
                await updateEmployee({
                    variables: {
                        id: employee.id,
                        input: employeeInput,
                    },
                });

                toast.message("Employee updated", {
                    description: `${data.name}'s information has been updated successfully.`,
                });
            } else {
                // Create a new employee
                await createEmployee({
                    variables: {
                        input: employeeInput,
                    },
                });

                toast.message("Employee created", {
                    description: `${data.name} has been added successfully.`,
                });
            }

            // Close dialog and refresh data
            onOpenChange(false);
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Error saving employee:', error);
            toast.error("Error", {
                description: `There was an error ${isEditing ? 'updating' : 'creating'} the employee. Please try again.`,
            });
        }
    };

    function getSaveUpdateButtonText() {
        if (isLoading) {
            return "Saving...";
        }
        if (isEditing) {
            return "Update";
        }
        return "Create";
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit' : 'Add'} Employee
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update employee information in the system.'
                            : 'Add a new employee to the system.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Name*</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter employee name" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        The full name of the employee
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="position"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Position</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter position" {...field} value={field.value ?? ''}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="department"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Department</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter department" {...field} value={field.value ?? ''}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="teamId"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Team</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value ?? ''}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a team"/>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {/*<SelectItem value="">None</SelectItem>*/}
                                                {teams.map(team => (
                                                    <SelectItem key={team.id} value={team.id}>
                                                        {team.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({field}) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Start Date</FormLabel>
                                        <Popover>
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
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="managerId"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Manager</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        value={field.value ?? ''}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a manager"/>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {/*<SelectItem value="">None</SelectItem>*/}
                                            {managers
                                                .filter(manager => manager.id !== employee?.id) // Don't allow self as manager
                                                .map(manager => (
                                                    <SelectItem key={manager.id} value={manager.id}>
                                                        {manager.name}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        The manager this employee reports to
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
                                {getSaveUpdateButtonText()}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default EmployeeFormDialog;