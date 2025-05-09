import React, {useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {useDeleteActionItem, useGetActionItems, useGetCurrentRatings, useGetEmployee} from '@/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import RatingForm from "@/components/ratings/RatingForm";
import ActionItemForm from "@/components/actions/ActionItemForm";
import ActionItemStatusForm from "@/components/actions/ActionItemStatusForm";
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Badge} from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    ArrowLeft,
    Ban,
    BarChart,
    Briefcase,
    Building,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    Edit,
    PlusCircle,
    Trash2,
    UserRound,
    XCircle
} from 'lucide-react';
import {ActionStatus, CampsCategory} from '@/types/schema';
import {toast} from 'sonner';

// Map CAMPS categories to friendly names and colors
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

// Map action item status to friendly names and icons
const ACTION_STATUS = {
    [ActionStatus.PLANNED]: {
        name: 'Planned',
        icon: PlusCircle,
        color: 'bg-blue-100 text-blue-800'
    },
    [ActionStatus.IN_PROGRESS]: {
        name: 'In Progress',
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-800'
    },
    [ActionStatus.COMPLETED]: {
        name: 'Completed',
        icon: CheckCircle2,
        color: 'bg-green-100 text-green-800'
    },
    [ActionStatus.CANCELLED]: {
        name: 'Cancelled',
        icon: XCircle,
        color: 'bg-gray-100 text-gray-800'
    },
};

const EmployeeDetail: React.FC = () => {
    const {employeeId} = useParams<{ employeeId: string }>();
    const [activeTab, setActiveTab] = useState('ratings');

    // State for rating form dialog
    const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<CampsCategory | null>(null);
    const [selectedRating, setSelectedRating] = useState<any>(null);

    // State for action item dialogs
    const [actionItemDialogOpen, setActionItemDialogOpen] = useState(false);
    const [selectedActionItem, setSelectedActionItem] = useState<any>(null);

    const [actionStatusDialogOpen, setActionStatusDialogOpen] = useState(false);
    const [actionStatusType, setActionStatusType] = useState<'complete' | 'cancel'>('complete');
    const [selectedActionItemId, setSelectedActionItemId] = useState<string | null>(null);

    // State for delete confirmation
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [actionItemToDelete, setActionItemToDelete] = useState<string | null>(null);

    const {
        data: employeeData,
        loading: employeeLoading,
        error: employeeError,
        refetch: refetchEmployee
    } = useGetEmployee({
        variables: {id: employeeId ?? ''},
        skip: !employeeId
    });

    const {
        data: ratingsData,
        loading: ratingsLoading,
        error: ratingsError,
        refetch: refetchRatings
    } = useGetCurrentRatings({
        variables: {employeeId: employeeId ?? ''},
        skip: !employeeId
    });

    const {
        data: actionItemsData,
        loading: actionItemsLoading,
        error: actionItemsError,
        refetch: refetchActionItems
    } = useGetActionItems({
        variables: {employeeId: employeeId ?? ''},
        skip: !employeeId
    });

    // Mutation for deleting action items
    const [deleteActionItem, {loading: deleteLoading}] = useDeleteActionItem();

    const employee = employeeData?.employee;
    const currentRatings = ratingsData?.currentRatings || [];
    const actionItems = actionItemsData?.actionItems ?? [];

    const isLoading = employeeLoading || ratingsLoading || actionItemsLoading;
    const error = employeeError || ratingsError || actionItemsError;

    // Format date string
    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    };

    // Calculate average rating across all categories
    const calculateAverageRating = () => {
        if (!currentRatings.length) return 0;
        const sum = currentRatings.reduce((acc, rating) => acc + rating.rating, 0);
        return Math.round((sum / currentRatings.length) * 10) / 10; // Round to 1 decimal place
    };

    // Handle opening the rating dialog for adding/editing a rating
    const handleOpenRatingDialog = (category: CampsCategory, existingRating?: any) => {
        setSelectedCategory(category);
        setSelectedRating(existingRating);
        setRatingDialogOpen(true);
    };

    // Handle opening action item form dialog
    const handleOpenActionItemDialog = (actionItem?: any) => {
        setSelectedActionItem(actionItem);
        setActionItemDialogOpen(true);
    };

    // Handle opening action status dialog (complete or cancel)
    const handleOpenActionStatusDialog = (actionItemId: string, type: 'complete' | 'cancel') => {
        setSelectedActionItemId(actionItemId);
        setActionStatusType(type);
        setActionStatusDialogOpen(true);
    };

    // Handle opening delete confirmation dialog
    const handleOpenDeleteDialog = (actionItemId: string) => {
        setActionItemToDelete(actionItemId);
        setDeleteDialogOpen(true);
    };

    // Handle deleting an action item
    const handleDeleteActionItem = async () => {
        if (!actionItemToDelete) return;

        try {
            await deleteActionItem({
                variables: {
                    id: actionItemToDelete
                }
            });

            toast.message("Action Item deleted", {
                description: "The action item has been deleted successfully."
            });

            await refetchActionItems();
        } catch (error) {
            console.error('Error deleting action item:', error);
            toast.error("Error", {
                description: "There was an error deleting the action item.",
            });
        } finally {
            setDeleteDialogOpen(false);
            setActionItemToDelete(null);
        }
    };

    // Refresh data after a rating is saved
    const handleRatingSuccess = () => {
        refetchRatings();
        refetchEmployee();
    };

    // Refresh data after an action item is saved
    const handleActionItemSuccess = () => {
        // First, close the dialog and reset the state
        setActionItemDialogOpen(false);
        setSelectedActionItem(null);

        // Then, after a small delay, refetch the action items
        // This ensures that React has time to process the state change before starting a new operation
        setTimeout(() => {
            refetchActionItems();
        }, 100);
    };

    const handleActionItemDialogClose = (open: boolean) => {
        setActionItemDialogOpen(open);
        if (!open) {
            setSelectedActionItem(null);
        }
    };

    const handleActionStatusDialogClose = (open: boolean) => {
        setActionStatusDialogOpen(open);
        if (!open) {
            setSelectedActionItemId(null);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Loading employee data...</div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-64">
                    <div className="text-lg text-red-500 mb-4">Error loading employee data</div>
                    <Button asChild>
                        <Link to="/">Back to Dashboard</Link>
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    if (!employee) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-64">
                    <div className="text-lg mb-4">Employee not found</div>
                    <Button asChild>
                        <Link to="/">Back to Dashboard</Link>
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Back button */}
                <div>
                    <Button variant="ghost" asChild className="pl-0">
                        <Link to="/" className="flex items-center gap-1">
                            <ArrowLeft className="h-4 w-4"/>
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>

                {/* Employee Information */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start">
                            <div className="flex items-center justify-center bg-primary/10 rounded-full p-6">
                                <UserRound className="h-12 w-12 text-primary"/>
                            </div>

                            <div className="space-y-4 flex-1">
                                <div>
                                    <h2 className="text-2xl font-bold">{employee.name}</h2>
                                    <p className="text-muted-foreground">{employee.position ?? 'No position specified'}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-muted-foreground"/>
                                        <span>Department: {employee.department ?? 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-muted-foreground"/>
                                        <span>Team: {employee.team?.name ?? 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground"/>
                                        <span>Start Date: {formatDate(employee.startDate)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <div
                                    className="flex items-center justify-center rounded-full h-20 w-20 bg-primary text-primary-foreground text-3xl font-bold">
                                    {calculateAverageRating()}
                                </div>
                                <span className="text-sm text-muted-foreground">Avg. Rating</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs for Ratings and Action Items */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="ratings" className="flex items-center gap-2">
                            <BarChart className="h-4 w-4"/>
                            CAMPS Ratings
                        </TabsTrigger>
                        <TabsTrigger value="actions" className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4"/>
                            Action Items {actionItems.length > 0 && `(${actionItems.length})`}
                        </TabsTrigger>
                    </TabsList>

                    {/* CAMPS Ratings Tab Content */}
                    <TabsContent value="ratings" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(CAMPS_CATEGORIES).map(([category, info]) => {
                                const categoryEnum = category as CampsCategory;
                                const rating = currentRatings.find(r => r.category === category);
                                const ratingValue = rating ? rating.rating : 0;

                                return (
                                    <Card key={category}>
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full ${info.color}`}></div>
                                                    <CardTitle className="text-lg">{info.name}</CardTitle>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="text-2xl font-bold">{ratingValue || '-'}</div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleOpenRatingDialog(categoryEnum, rating)}
                                                        title={rating ? "Edit rating" : "Add rating"}
                                                    >
                                                        {rating ? <Edit className="h-4 w-4"/> :
                                                            <PlusCircle className="h-4 w-4"/>}
                                                    </Button>
                                                </div>
                                            </div>
                                            <CardDescription>{info.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${info.color}`}
                                                    style={{width: `${(ratingValue / 10) * 100}%`}}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                                                <span>1</span>
                                                <span>5</span>
                                                <span>10</span>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="text-sm">
                                            {rating?.notes && (
                                                <p className="text-muted-foreground italic">"{rating.notes}"</p>
                                            )}
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </div>
                    </TabsContent>

                    {/* Action Items Tab Content */}
                    <TabsContent value="actions">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>Action Items</CardTitle>
                                        <CardDescription>
                                            Tasks and activities to improve employee engagement
                                        </CardDescription>
                                    </div>
                                    <Button size="sm" onClick={() => handleOpenActionItemDialog()}>
                                        <PlusCircle className="h-4 w-4 mr-2"/>
                                        Add Action Item
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {actionItems.length === 0 ? (
                                    <div className="text-center p-6 text-muted-foreground">
                                        No action items found for this employee.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {actionItems.map(item => {
                                            const statusInfo = ACTION_STATUS[item.status];
                                            const StatusIcon = statusInfo.icon;
                                            const isActionable = item.status !== ActionStatus.COMPLETED &&
                                                item.status !== ActionStatus.CANCELLED;

                                            return (
                                                <div key={item.id} className="border rounded-md p-4">
                                                    <div className="flex items-start gap-4">
                                                        {/* Left side content */}
                                                        <div className="flex-1 min-w-0">
                                                            <Badge className={statusInfo.color}>
                                                                <StatusIcon className="h-3 w-3 mr-1" />
                                                                {statusInfo.name}
                                                            </Badge>
                                                            <div className="font-medium">{item.description}</div>
                                                            {item.category && (
                                                                <div className="text-sm text-muted-foreground mt-1">
                                                                    Category: {CAMPS_CATEGORIES[item.category].name}
                                                                </div>
                                                            )}

                                                        </div>

                                                        {/* Right side actions */}
                                                        <div className="flex items-center gap-0.5 flex-shrink-0">


                                                            {/* Horizontally aligned action icons */}
                                                            <div className="flex items-center">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleOpenActionItemDialog(item)}
                                                                    title="Edit action item"
                                                                    className="h-8 w-8"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>

                                                                {isActionable && (
                                                                    <>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => handleOpenActionStatusDialog(item.id, 'complete')}
                                                                            title="Mark as completed"
                                                                            className="h-8 w-8 text-green-600 hover:text-green-700"
                                                                        >
                                                                            <Check className="h-4 w-4" />
                                                                        </Button>

                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => handleOpenActionStatusDialog(item.id, 'cancel')}
                                                                            title="Cancel action item"
                                                                            className="h-8 w-8 text-orange-600 hover:text-orange-700"
                                                                        >
                                                                            <Ban className="h-4 w-4" />
                                                                        </Button>
                                                                    </>
                                                                )}

                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleOpenDeleteDialog(item.id)}
                                                                    title="Delete action item"
                                                                    className="h-8 w-8 text-red-600 hover:text-red-700"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Rest of the action item content */}
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4 text-sm">
                                                        <div>
                                                            <span className="text-muted-foreground">Created: </span>
                                                            {formatDate(item.createdDate)}
                                                        </div>
                                                        {item.dueDate && (
                                                            <div>
                                                                <span className="text-muted-foreground">Due: </span>
                                                                {formatDate(item.dueDate)}
                                                            </div>
                                                        )}
                                                        {item.completedDate && (
                                                            <div>
                                                                <span className="text-muted-foreground">Completed: </span>
                                                                {formatDate(item.completedDate)}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {item.outcome && (
                                                        <div className="mt-2 text-sm border-t pt-2">
                                                            <span className="text-muted-foreground">Outcome: </span>
                                                            {item.outcome}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Rating Form Dialog */}
                {ratingDialogOpen && selectedCategory && (
                    <RatingForm
                        open={ratingDialogOpen}
                        onOpenChange={setRatingDialogOpen}
                        employeeId={employeeId ?? ''}
                        category={selectedCategory}
                        existingRating={selectedRating}
                        onSuccess={handleRatingSuccess}
                    />
                )}

                {/* Action Item Form Dialog */}
                {actionItemDialogOpen && (
                    <ActionItemForm
                        open={actionItemDialogOpen}
                        onOpenChange={handleActionItemDialogClose}
                        employeeId={employeeId ?? ''}
                        existingItem={selectedActionItem}
                        onSuccess={handleActionItemSuccess}
                    />
                )}

                {/* Action Status Form Dialog */}
                {actionStatusDialogOpen && selectedActionItemId && (
                    <ActionItemStatusForm
                        open={actionStatusDialogOpen}
                        onOpenChange={handleActionStatusDialogClose}
                        actionItemId={selectedActionItemId ?? ''}
                        actionType={actionStatusType}
                        onSuccess={handleActionItemSuccess}
                    />
                )}

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete this action item. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteActionItem}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {deleteLoading ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </DashboardLayout>
    );
};

export default EmployeeDetail;