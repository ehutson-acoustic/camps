// src/components/ratings/RatingForm.tsx
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {format} from 'date-fns';
import {CampsCategory} from '@/types/schema';
import {useCreateRating, useUpdateRating} from '@/api';

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
import {Slider} from '@/components/ui/slider';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {toast} from 'sonner';

// CAMPS category info with descriptions
const CAMPS_CATEGORIES = {
    [CampsCategory.CERTAINTY]: {
        name: 'Certainty',
        description: 'Confidence about the future and how things work',
        color: 'bg-blue-500'
    },
    [CampsCategory.AUTONOMY]: {
        name: 'Autonomy',
        description: 'Control over decisions that affect your work',
        color: 'bg-green-500'
    },
    [CampsCategory.MEANING]: {
        name: 'Meaning',
        description: 'Sense of purpose and fulfillment in work',
        color: 'bg-purple-500'
    },
    [CampsCategory.PROGRESS]: {
        name: 'Progress',
        description: 'Moving forward and achieving goals',
        color: 'bg-orange-500'
    },
    [CampsCategory.SOCIAL_INCLUSION]: {
        name: 'Social Inclusion',
        description: 'Feeling part of a supportive team/community',
        color: 'bg-pink-500'
    },
};

// Form schema definition
const formSchema = z.object({
    rating: z.number().min(1).max(10),
    notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RatingFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employeeId: string;
    category: CampsCategory;
    existingRating?: {
        id: string;
        rating: number;
        notes?: string | null;
    };
    onSuccess?: () => void;
}

const RatingForm = ({
                        open,
                        onOpenChange,
                        employeeId,
                        category,
                        existingRating,
                        onSuccess,
                    }: RatingFormProps) => {
    const isEditing = !!existingRating;

    // Initialize the form
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            rating: existingRating?.rating ?? 5,
            notes: existingRating?.notes ?? '',
        },
    });

    // Mutations for creating/updating ratings
    const [createRating, {loading: createLoading}] = useCreateRating();
    const [updateRating, {loading: updateLoading}] = useUpdateRating();

    const isLoading = createLoading || updateLoading;

    // Handle form submission
    const onSubmit = async (data: FormValues) => {
        try {
            if (isEditing && existingRating) {
                // Update existing rating
                await updateRating({
                    variables: {
                        id: existingRating.id,
                        input: {
                            employeeId,
                            ratingDate: format(new Date(), 'yyyy-MM-dd'),
                            category,
                            rating: data.rating,
                            notes: data.notes ?? null,
                        },
                    },
                });

                toast.message("Rating updated", {
                    description: `The ${CAMPS_CATEGORIES[category].name} rating has been updated.`,
                });
            } else {
                // Create new rating
                await createRating({
                    variables: {
                        input: {
                            employeeId,
                            ratingDate: format(new Date(), 'yyyy-MM-dd'),
                            category,
                            rating: data.rating,
                            notes: data.notes ?? null,
                        },
                    },
                });

                toast.message("Rating created", {
                    description: `A new ${CAMPS_CATEGORIES[category].name} rating has been created.`
                });
            }

            // Close dialog and refresh data
            onOpenChange(false);
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Error saving rating:', error);
            toast.error("Error", {
                description: "There was an error saving the rating. Please try again."
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit' : 'Add'} {CAMPS_CATEGORIES[category].name} Rating
                    </DialogTitle>
                    <DialogDescription>
                        {CAMPS_CATEGORIES[category].description}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="rating"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Rating (1-10)</FormLabel>
                                    <div className="flex flex-col space-y-2">
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>1</span>
                                            <span>5</span>
                                            <span>10</span>
                                        </div>
                                        <FormControl>
                                            <Slider
                                                value={[field.value]}
                                                min={1}
                                                max={10}
                                                step={1}
                                                onValueChange={(value) => field.onChange(value[0])}
                                                className={CAMPS_CATEGORIES[category].color}
                                            />
                                        </FormControl>
                                        <div className="text-center text-2xl font-bold">
                                            {field.value}
                                        </div>
                                    </div>
                                    <FormDescription>
                                        Rate from 1 (lowest) to 10 (highest)
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Add any observations or context..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Optional: Add context or observations about this rating
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
                                {isLoading ? 'Saving...' : isEditing ? 'Update Rating' : 'Save Rating'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default RatingForm;