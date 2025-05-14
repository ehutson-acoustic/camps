import React from 'react';
import {useGetEmployee} from '@/api';
import {Employee} from '@/types/schema';
import {format} from 'date-fns';
import {Card} from '@/components/ui/card';
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
import {Badge} from '@/components/ui/badge';
import {Briefcase, Building2, Calendar, UserRound, Users} from 'lucide-react';
import {Separator} from '@/components/ui/separator';

interface EmployeeProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employeeId: string;
}

const EmployeeProfileDialog: React.FC<EmployeeProfileDialogProps> = ({
                                                                         open,
                                                                         onOpenChange,
                                                                         employeeId,
                                                                     }) => {
    // Fetch employee data
    const {data, loading, error} = useGetEmployee({
        variables: {id: employeeId},
        skip: !employeeId,
    });

    const employee = data?.employee;

    // Get initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Format date
    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'N/A';
        return format(new Date(dateString), 'MMMM d, yyyy');
    };

    function getEmployeeDetails(employee: Employee) {
        return <>
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-24 w-24 text-lg">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(employee.name)}
                        </AvatarFallback>
                    </Avatar>
                    {employee.team && (
                        <Badge variant="outline" className="mt-2">
                            {employee.team.name}
                        </Badge>
                    )}
                </div>

                <div className="flex-1">
                    <h2 className="text-2xl font-bold">{employee.name}</h2>
                    {employee.position && (
                        <p className="text-lg text-muted-foreground mb-4">{employee.position}</p>
                    )}

                    <div className="space-y-3">
                        {employee.department && (
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground"/>
                                <span>Department: {employee.department}</span>
                            </div>
                        )}

                        {employee.team && (
                            <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-muted-foreground"/>
                                <span>Team: {employee.team.name}</span>
                            </div>
                        )}

                        {employee.startDate && (
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground"/>
                                <span>Started: {formatDate(employee.startDate)}</span>
                            </div>
                        )}

                        {employee.manager && (
                            <div className="flex items-center gap-2">
                                <UserRound className="h-4 w-4 text-muted-foreground"/>
                                <span>Reports to: {employee.manager.name}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {employee.directReports && employee.directReports.length > 0 && (
                <>
                    <Separator className="my-4"/>
                    <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <Users className="h-5 w-5"/>
                            Direct Reports
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {employee.directReports.map(report => (
                                <Card key={report.id} className="p-2">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6 text-xs">
                                            <AvatarFallback className="bg-muted">
                                                {getInitials(report.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{report.name}</div>
                                            {report.position && (
                                                <div className="text-xs text-muted-foreground">{report.position}</div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </>;
    }

    function getDialogContents(employee: Employee | undefined) {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-48">
                    <p className="text-muted-foreground">Loading employee data...</p>
                </div>
            );
        } else if (error) {
            return (
                <div className="flex justify-center items-center h-48">
                    <p className="text-destructive">Error loading employee data: {error.message}</p>
                </div>
            );
        }
        return getEmployeeDetails(employee!);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Employee Profile</DialogTitle>
                    <DialogDescription>
                        View detailed information about this employee
                    </DialogDescription>
                </DialogHeader>

                {getDialogContents(employee)}

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EmployeeProfileDialog;