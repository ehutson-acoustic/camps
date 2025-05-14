import React, {useState} from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {useGetEmployees, useGetTeams} from '@/api';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {Badge} from '@/components/ui/badge';
import {Eye, MoreHorizontal, PencilIcon, Plus, Search, Trash2, UserRound, X} from 'lucide-react';
import {Employee} from '@/types/schema';
import {format} from 'date-fns';
import EmployeeFormDialog from '@/components/admin/employee/EmployeeFormDialog';
import DeleteEmployeeDialog from '@/components/admin/employee/DeleteEmployeeDialog';
import EmployeeProfileDialog from '@/components/admin/employee/EmployeeProfileDialog';

const EmployeeAdmin: React.FC = () => {
    // State for search and filtering
    const [searchQuery, setSearchQuery] = useState('');
    const [teamFilter, setTeamFilter] = useState<string | null>(null);

    // State for dialogs
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [profileDialogOpen, setProfileDialogOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    // Fetch employees and teams data
    const {
        data: employeesData,
        loading: employeesLoading,
        refetch: refetchEmployees
    } = useGetEmployees();

    const {
        data: teamsData,
        loading: teamsLoading
    } = useGetTeams();

    const isLoading = employeesLoading || teamsLoading;

    // Format date for display
    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'N/A';
        return format(new Date(dateString), 'MMM d, yyyy');
    };

    // Filter employees based on search query and team filter
    const filteredEmployees = React.useMemo(() => {
        if (!employeesData?.employees) return [];

        return employeesData.employees.filter(employee => {
            // Apply team filter if selected
            if (teamFilter && employee.team?.id !== teamFilter) {
                return false;
            }

            // Apply search filter if provided
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    employee.name.toLowerCase().includes(query) ||
                    (employee.position?.toLowerCase().includes(query) || false) ||
                    (employee.department?.toLowerCase().includes(query) || false)
                );
            }

            return true;
        });
    }, [employeesData?.employees, searchQuery, teamFilter]);

    // Handle creating a new employee
    const handleCreateEmployee = () => {
        setSelectedEmployee(null);
        setFormDialogOpen(true);
    };

    // Handle editing an employee
    const handleEditEmployee = (employee: Employee) => {
        setSelectedEmployee(employee);
        setFormDialogOpen(true);
    };

    // Handle viewing an employee's profile
    const handleViewEmployee = (employee: Employee) => {
        setSelectedEmployee(employee);
        setProfileDialogOpen(true);
    };

    // Handle deleting an employee
    const handleDeleteEmployee = (employee: Employee) => {
        setSelectedEmployee(employee);
        setDeleteDialogOpen(true);
    };

    // Refresh data after successful operations
    const handleOperationSuccess = () => {
        refetchEmployees();
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('');
        setTeamFilter(null);
    };

    function getEmployeeTable() {
        return <div className="relative w-full overflow-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredEmployees.map((employee) => (
                        <TableRow key={employee.id}>
                            <TableCell className="font-medium">{employee.name}</TableCell>
                            <TableCell>{employee.position ?? '-'}</TableCell>
                            <TableCell>{employee.department ?? '-'}</TableCell>
                            <TableCell>
                                {employee.team ? (
                                    <Badge variant="secondary" className="font-normal">
                                        {employee.team.name}
                                    </Badge>
                                ) : (
                                    '-'
                                )}
                            </TableCell>
                            <TableCell>{employee.startDate ? formatDate(employee.startDate) : '-'}</TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4"/>
                                            <span className="sr-only">Actions</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={() => handleViewEmployee(employee)}>
                                            <Eye className="mr-2 h-4 w-4"/>
                                            View
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleEditEmployee(employee)}>
                                            <PencilIcon className="mr-2 h-4 w-4"/>
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator/>
                                        <DropdownMenuItem
                                            onClick={() => handleDeleteEmployee(employee)}
                                            className="text-destructive focus:text-destructive"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4"/>
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>;
    }

    function displayEmployeeData() {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Loading employee data...</p>
                </div>
            );
        }

        if (filteredEmployees.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-64">
                    <p className="text-muted-foreground">No employees
                        found{(searchQuery || teamFilter) ? ' matching your filters' : ''}.</p>
                    {(searchQuery || teamFilter) && (
                        <Button variant="link" onClick={clearFilters} className="mt-2">
                            Reset Filters
                        </Button>
                    )}
                </div>
            );
        } else {
            return getEmployeeTable();
        }
    }

    return (
        <AdminLayout>
            <div className="space-y-4">
                {/* Header with title and actions */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold flex items-center">
                        <UserRound className="mr-2 h-6 w-6"/>
                        Employee Management
                    </h1>

                    <Button onClick={handleCreateEmployee}>
                        <Plus className="h-4 w-4 mr-2"/>
                        Add Employee
                    </Button>
                </div>

                {/* Filtering controls */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>Filter employees by name, position, department, or team</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                                <Input
                                    placeholder="Search employees..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-9 w-9"
                                        onClick={() => setSearchQuery('')}
                                    >
                                        <X className="h-4 w-4"/>
                                        <span className="sr-only">Clear search</span>
                                    </Button>
                                )}
                            </div>
                            <div className="w-full md:w-[200px]">
                                <Select value={teamFilter ?? ''}
                                        onValueChange={(value) => setTeamFilter(value || null)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by team"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/*<SelectItem value="">All Teams</SelectItem>*/}
                                        {teamsData?.teams?.map(team => (
                                            <SelectItem key={team.id} value={team.id}>
                                                {team.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                variant="outline"
                                onClick={clearFilters}
                                disabled={!searchQuery && !teamFilter}
                            >
                                Reset Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Employees table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Employee List</CardTitle>
                        <CardDescription>
                            Showing {filteredEmployees.length} {filteredEmployees.length === 1 ? 'employee' : 'employees'}
                            {(searchQuery || teamFilter) && ' matching filters'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {displayEmployeeData()}
                    </CardContent>
                </Card>
            </div>

            {/* Employee Form Dialog */}
            {formDialogOpen && (
                <EmployeeFormDialog
                    open={formDialogOpen}
                    onOpenChange={setFormDialogOpen}
                    employee={selectedEmployee || undefined}
                    teams={teamsData?.teams || []}
                    managers={employeesData?.employees || []}
                    onSuccess={handleOperationSuccess}
                />
            )}

            {/* Delete Confirmation Dialog */}
            {deleteDialogOpen && selectedEmployee && (
                <DeleteEmployeeDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    employee={selectedEmployee}
                    onSuccess={handleOperationSuccess}
                />
            )}

            {/* Employee Profile Dialog */}
            {profileDialogOpen && selectedEmployee && (
                <EmployeeProfileDialog
                    open={profileDialogOpen}
                    onOpenChange={setProfileDialogOpen}
                    employeeId={selectedEmployee.id}
                />
            )}
        </AdminLayout>
    );
};

export default EmployeeAdmin;