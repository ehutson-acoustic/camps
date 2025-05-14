import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Settings} from 'lucide-react';

const AdminDashboard: React.FC = () => {
    return (
        <AdminLayout>
            <div className="space-y-4">
                <h1 className="text-2xl font-bold flex items-center">
                    <Settings className="mr-2 h-6 w-6"/>
                    Admin Dashboard
                </h1>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>Employees</CardTitle>
                            <CardDescription>Manage employee profiles</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">0</p>
                            <p className="text-xs text-muted-foreground">Total employees</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>Teams</CardTitle>
                            <CardDescription>Manage teams and assignments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">0</p>
                            <p className="text-xs text-muted-foreground">Total teams</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>System</CardTitle>
                            <CardDescription>General system settings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Configure application settings</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;