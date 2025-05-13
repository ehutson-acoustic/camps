// src/components/ratings/RatingForm.tsx
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {CampsCategory} from '@/types/schema';

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
import {useAddRating} from "@/api";
import {CAMPS_CATEGORIES} from "@/lib/CampsCategories";
import {OffsetDateTime} from "@js-joda/core";

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
    const [addRating, {loading: ratingLoading}] = useAddRating();

    const isLoading = ratingLoading;

    // Handle form submission
    const onSubmit = async (data: FormValues) => {
        try {
            if (isEditing && existingRating) {
                // Update existing rating
                await addRating({
                    variables: {
                        input: {
                            employeeId,
                            ratingDate: OffsetDateTime.now().toString(),
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
                // Create a new rating
                await addRating({
                    variables: {
                        input: {
                            employeeId,
                            ratingDate: OffsetDateTime.now().toString(),
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

    function getSaveButtonText() {
        if (isLoading) {
            return 'Saving...';
        }
        return isEditing ? 'Update Rating' : 'Save Rating';
    }

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
                                {getSaveButtonText()}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default RatingForm;