import React, {useState} from 'react';
import {gql, useMutation} from '@apollo/client';
import AdminLayout from '@/components/layout/AdminLayout';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {useGetTeams} from '@/api';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Loader2} from 'lucide-react';
import {toast} from 'sonner';
import {Label} from "recharts";

const RECALCULATE_TRENDS = gql`
    mutation RecalculateTrends($teamId: ID) {
        recalculateTrends(teamId: $teamId) {
            success
            message
        }
    }
`;

const TrendManagement: React.FC = () => {
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
    const {data: teamsData, loading: teamsLoading} = useGetTeams();

    const [recalculateTrends, {loading}] = useMutation(RECALCULATE_TRENDS, {
        onCompleted: (data) => {
            if (data.recalculateTrends.success) {
                toast.success("Success", {
                    description: data.recalculateTrends.message
                });
            } else {
                toast.error("Error", {
                    description: data.recalculateTrends.message ?? "Failed to recalculate trends"
                });
            }
        },
        onError: (error) => {
            toast.error("Error", {
                description: error.message
            });
        }
    });

    const handleRecalculate = () => {
        recalculateTrends({
            variables: {
                teamId: selectedTeamId
            }
        });
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Trend Data Management</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Recalculate Trend Data</CardTitle>
                        <CardDescription>
                            Force a recalculation of trend data for a specific team or all teams.
                            This process runs asynchronously and may take some time to complete.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Select Team</Label>
                                <Select
                                    value={selectedTeamId ?? ""}
                                    onValueChange={(value) => setSelectedTeamId(value || null)}
                                    disabled={teamsLoading || loading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Teams"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Teams</SelectItem>
                                        {teamsData?.teams?.map(team => (
                                            <SelectItem key={team.id} value={team.id}>
                                                {team.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Leave empty to recalculate for all teams
                                </p>
                            </div>

                            <div className="flex items-end">
                                <Button
                                    onClick={handleRecalculate}
                                    disabled={loading}
                                    className="w-full md:w-auto"
                                >
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                    {loading ? "Processing..." : "Recalculate Trends"}
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-md bg-muted p-4">
                            <h3 className="text-sm font-medium mb-2">Information</h3>
                            <p className="text-sm text-muted-foreground">
                                Trend data is automatically calculated daily and whenever trends haven't been updated in
                                24 hours.
                                Manual recalculation should only be needed in special circumstances.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default TrendManagement;