// src/pages/TeamDashboard.tsx
import React from 'react';
import {useParams} from 'react-router-dom';
import {useGetTeam, useGetTeamAverages} from '@/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {CAMPS_CATEGORIES} from '@/lib/CampsCategories.ts';
import {Navigate} from "react-router";

const TeamDashboard: React.FC = () => {
    const {teamId} = useParams<{ teamId: string }>();

    // Memoize the date to avoid unnecessary re-renders
    const currentDate = React.useMemo(() => new Date().toISOString(), []);

    // Use the skip option to conditionally skip the query if teamId is undefined
    const {data: teamData, loading: teamLoading, error: teamError} = useGetTeam({
        variables: {teamId: teamId ?? ''},
        skip: !teamId
    });

    // Fetch team averages, also using skip
    const {data: averagesData, loading: averagesLoading} = useGetTeamAverages({
        variables: {teamId: teamId ?? '', date: currentDate},
        skip: !teamId
    });

    // Redirect if teamId is undefined
    if (!teamId) {
        return <Navigate to="/"/>;
    }

    // Handle loading and error states
    if (teamLoading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-screen">
                    <p className="text-muted-foreground">Loading team data...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (teamError) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-screen">
                    <p className="text-destructive">Error loading team data: {teamError.message}</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">{teamData?.team?.name} Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Summary Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Overview</CardTitle>
                            <CardDescription>Key metrics and stats</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p>Members: {teamData?.team?.members?.length ?? 0}</p>
                                {/* Add more team metrics */}
                            </div>
                        </CardContent>
                    </Card>

                    {/* CAMPS ratings summary */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>CAMPS Ratings</CardTitle>
                            <CardDescription>Average scores across categories</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {averagesLoading ? (
                                <p>Loading ratings...</p>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {averagesData?.teamAverages?.map(avg => (
                                        <div key={avg.category} className="text-center">
                                            <div className="text-xl font-bold">{avg.averageRating.toFixed(1)}</div>
                                            <div className="text-sm">{CAMPS_CATEGORIES[avg.category].name}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Add more dashboard cards as needed */}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default TeamDashboard;