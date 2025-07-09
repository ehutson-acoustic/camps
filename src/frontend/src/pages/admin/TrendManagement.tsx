import React, {useState} from 'react';
import {gql, useMutation} from '@apollo/client';
import AdminLayout from '@/components/layout/AdminLayout';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {useGetTeams} from '@/api';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Loader2, CheckCircle, AlertCircle} from 'lucide-react';
import {toast} from 'sonner';
import {Label} from "recharts";

const RECALCULATE_TRENDS = gql`
    mutation RecalculateWeeklyTrends($teamId: ID) {
        recalculateWeeklyTrends(teamId: $teamId) {
            success
            message
            calculatedRecords
            errors
        }
    }
`;

const ALL_TEAMS_VALUE = "all_teams";

const TrendManagement: React.FC = () => {
    const [selectedTeamId, setSelectedTeamId] = useState<string>(ALL_TEAMS_VALUE);
    const [lastResult, setLastResult] = useState<{success: boolean, message: string, calculatedRecords?: number} | null>(null);
    const {data: teamsData, loading: teamsLoading} = useGetTeams();

    const [recalculateTrends, {loading}] = useMutation(RECALCULATE_TRENDS, {
        onCompleted: (data) => {
            if (data.recalculateWeeklyTrends.success) {
                let message = data.recalculateWeeklyTrends.message;
                if (data.recalculateWeeklyTrends.calculatedRecords) {
                    message += ` (${data.recalculateWeeklyTrends.calculatedRecords} records processed)`;
                }
                
                setLastResult({
                    success: true,
                    message: message,
                    calculatedRecords: data.recalculateWeeklyTrends.calculatedRecords
                });
                
                toast.success("Success", {
                    description: message
                });
            } else {
                const errors = data.recalculateWeeklyTrends.errors || [];
                const errorMessage = errors.length > 0 ? errors.join(", ") : (data.recalculateWeeklyTrends.message ?? "Failed to recalculate trends");
                
                setLastResult({
                    success: false,
                    message: errorMessage
                });
                
                toast.error("Error", {
                    description: errorMessage
                });
            }
        },
        onError: (error) => {
            setLastResult({
                success: false,
                message: error.message
            });
            
            toast.error("Error", {
                description: error.message
            });
        }
    });

    const handleRecalculate = () => {
        // Clear previous result
        setLastResult(null);
        
        recalculateTrends({
            variables: {
                teamId: selectedTeamId === ALL_TEAMS_VALUE ? null : selectedTeamId
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
                                    value={selectedTeamId}
                                    onValueChange={(value) => setSelectedTeamId(value)}
                                    disabled={teamsLoading || loading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a team"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ALL_TEAMS_VALUE}>All Teams</SelectItem>
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
                                    disabled={loading || teamsLoading}
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

                        {loading && (
                            <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                    <span className="text-sm font-medium">Processing</span>
                                </div>
                                <p className="mt-1 text-sm text-blue-600">
                                    Trend calculation is running in the background. This may take a few moments to complete.
                                </p>
                            </div>
                        )}

                        {lastResult && !loading && (
                            <div className={`rounded-md border p-4 ${lastResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                                <div className="flex items-center gap-2">
                                    {lastResult.success ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                    )}
                                    <span className="text-sm font-medium">
                                        {lastResult.success ? "Success" : "Error"}
                                    </span>
                                </div>
                                <p className={`mt-1 text-sm ${lastResult.success ? "text-green-600" : "text-red-600"}`}>
                                    {lastResult.message}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default TrendManagement;