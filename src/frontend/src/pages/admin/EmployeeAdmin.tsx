import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Plus, UserRound} from 'lucide-react';

const EmployeeAdmin: React.FC = () => {
    return (
        <AdminLayout>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold flex items-center">
                        <UserRound className="mr-2 h-6 w-6"/>
                        Employee Management
                    </h1>

                    <Button>
                        <Plus className="h-4 w-4 mr-2"/>
                        Add Employee
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Employee List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Employee listing will be implemented here. This will include a table with search, filtering,
                            and CRUD operations.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default EmployeeAdmin;