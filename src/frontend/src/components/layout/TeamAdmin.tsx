import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Building2, Plus} from 'lucide-react';

const TeamAdmin: React.FC = () => {
    return (
        <AdminLayout>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold flex items-center">
                        <Building2 className="mr-2 h-6 w-6"/>
                        Team Management
                    </h1>

                    <Button>
                        <Plus className="h-4 w-4 mr-2"/>
                        Add Team
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Team List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Team listing will be implemented here. This will include a table with search, filtering,
                            and CRUD operations. Each team will have the ability to manage its members.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default TeamAdmin;