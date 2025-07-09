// src/pages/TeamDashboard.tsx
import React, {useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {useGetEmployees, useGetTeam, useGetTeamAverages, useGetTrends} from '@/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import {Skeleton} from '@/components/ui/skeleton';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import {Activity, AlertTriangle, ArrowDownIcon, ArrowUpIcon, ChevronRight, TrendingUp, Users} from 'lucide-react';
import {CAMPS_CATEGORIES} from '@/lib/CampsCategories.ts';
import {Navigate} from "react-router";
import {CampsCategory, TimePeriod} from '@/types/schema';
import {format} from 'date-fns';

const TeamDashboard: React.FC = () => {
    const {teamId} = useParams<{ teamId: string }>();
    const [timePeriod, setTimePeriod] = useState<TimePeriod>(TimePeriod.LAST_90_DAYS);
    const [selectedCategory, setSelectedCategory] = useState<CampsCategory>(CampsCategory.CERTAINTY);

    // Memoize the date to avoid unnecessary re-renders
    const currentDate = React.useMemo(() => new Date().toISOString(), []);

    // Utility function to format change values
    const formatChangeValue = (value: number | null | undefined, showSign: boolean = true): string => {
        if (value === null || value === undefined) return 'N/A';
        const sign = showSign && value > 0 ? '+' : '';
        return `${sign}${value.toFixed(1)} pts`;
    };

    // Utility function to get change color class
    const getChangeColorClass = (value: number | null | undefined): string => {
        if (value === null || value === undefined) return 'text-muted-foreground';
        if (value > 0.5) return 'text-green-600';
        if (value < -0.5) return 'text-red-600';
        return 'text-muted-foreground';
    };

    // Utility function to get border color class for cards
    const getCardBorderClass = (value: number | null | undefined): string => {
        if (value === null || value === undefined) return '';
        if (value > 0.5) return 'border-green-200 bg-green-50/50';
        if (value < -0.5) return 'border-red-200 bg-red-50/50';
        return '';
    };

    // Fetch team data
    const {data: teamData, loading: teamLoading, error: teamError} = useGetTeam({
        variables: {teamId: teamId ?? ''},
        skip: !teamId
    });

    // Fetch team members
    const {data: employeesData, loading: employeesLoading} = useGetEmployees({
        variables: {teamId},
        skip: !teamId
    });

    // Fetch team averages
    const {data: averagesData, loading: averagesLoading} = useGetTeamAverages({
        variables: {teamId: teamId ?? '', date: currentDate},
        skip: !teamId
    });

    // Fetch trends data for the selected category
    const {data: trendsData, loading: trendsLoading, error: trendsError} = useGetTrends({
        variables: {
            teamId: teamId ?? '',
            category: selectedCategory,
            timePeriod
        },
        skip: !teamId
    });

    // Define date range for stats (last 30 days)
    //const toDate = new Date();
    //const fromDate = new Date();
    //fromDate.setDate(fromDate.getDate() - 30);

    // Fetch team stats for the date range
    /*
    const {data: statsData, loading: statsLoading} = useGetTeamStats({
        variables: {
            teamId: teamId ?? '',
            dateRange: {
                fromDate: fromDate.toISOString(),
                toDate: toDate.toISOString()
            }
        },
        skip: !teamId
    });

     */

    // Calculate insights from the data
    const insights = React.useMemo(() => {
        if (!averagesData?.teamAverages) return null;

        // Find categories that need improvement (lowest scores)
        const needsImprovement = [...averagesData.teamAverages]
            .sort((a, b) => a.averageRating - b.averageRating)
            .slice(0, 2);

        // Find the most improved categories - prioritize weekOverWeekChange if available, fallback to change
        const mostImproved = [...averagesData.teamAverages]
            .filter(avg => {
                const changeValue = avg.weekOverWeekChange ?? avg.change;
                return changeValue && changeValue > 0;
            })
            .sort((a, b) => {
                const changeA = a.weekOverWeekChange ?? a.change ?? 0;
                const changeB = b.weekOverWeekChange ?? b.change ?? 0;
                return changeB - changeA;
            })
            .slice(0, 2);

        // Find categories with declining scores - prioritize weekOverWeekChange if available, fallback to change
        const declining = [...averagesData.teamAverages]
            .filter(avg => {
                const changeValue = avg.weekOverWeekChange ?? avg.change;
                return changeValue && changeValue < 0;
            })
            .sort((a, b) => {
                const changeA = a.weekOverWeekChange ?? a.change ?? 0;
                const changeB = b.weekOverWeekChange ?? b.change ?? 0;
                return changeA - changeB;
            })
            .slice(0, 2);

        return {needsImprovement, mostImproved, declining};
    }, [averagesData]);

    // Transform trends data for charts
    const trendChartData = React.useMemo(() => {
        if (!trendsData?.trends) return [];

        return trendsData.trends
            .filter(trend => trend.recordDate && trend.averageRating !== null) // Filter out invalid data
            .map(trend => {
                const monthChange = trend.monthOverMonthChange ?? 0;
                const weekChange = trend.weekOverWeekChange ?? 0;
                
                return {
                    date: format(new Date(trend.recordDate), 'MMM d'),
                    value: trend.averageRating,
                    change: monthChange, // Keep month-over-month for bar chart
                    weekChange: weekChange, // Add week-over-week for additional context
                    fillColor: monthChange >= 0 ? "#4CAF50" : "#F44336", // Color based on month change
                    weekFillColor: weekChange >= 0 ? "#4CAF50" : "#F44336", // Color based on week change
                    // Add additional properties for better chart rendering
                    quarterOverQuarterChange: trend.quarterOverQuarterChange ?? 0,
                    yearOverYearChange: trend.yearOverYearChange ?? 0,
                    // Add formatted date for sorting
                    sortDate: new Date(trend.recordDate)
                };
            })
            .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime()); // Sort by actual date
    }, [trendsData]);

    // Transform category data for radar chart
    const radarChartData = React.useMemo(() => {
        if (!averagesData?.teamAverages) return [];

        return averagesData.teamAverages.map(avg => ({
            category: CAMPS_CATEGORIES[avg.category].name,
            value: avg.averageRating,
            fullMark: 10
        }));
    }, [averagesData]);

    // Redirect if teamId is undefined
    if (!teamId) {
        return <Navigate to="/"/>;
    }

    // Handle loading and error states
    if (teamLoading) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <Skeleton className="h-10 w-1/3"/>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Skeleton className="h-60 w-full"/>
                        <Skeleton className="h-60 w-full md:col-span-2"/>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (teamError) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center p-8 text-destructive">
                    <div className="flex flex-col items-center gap-2">
                        <AlertTriangle className="h-10 w-10"/>
                        <h2 className="text-xl font-semibold">Error loading team data</h2>
                        <p>{teamError.message}</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    function getTeamMemberAverages() {
        if (employeesLoading) {
            return <CardContent><Skeleton className="h-60 w-full"/></CardContent>;
        }
        return <CardContent>
            {employeesData?.employees && employeesData.employees.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead className="text-center">Certainty</TableHead>
                            <TableHead className="text-center">Autonomy</TableHead>
                            <TableHead className="text-center">Meaning</TableHead>
                            <TableHead className="text-center">Progress</TableHead>
                            <TableHead className="text-center">Social</TableHead>
                            <TableHead className="text-center">Average</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {employeesData.employees.map(employee => {
                            // Calculate average rating if an employee has ratings
                            const currentRatings = employee.currentRatings || [];
                            const hasRatings = currentRatings.length > 0;
                            const avgRating = hasRatings
                                ? currentRatings.reduce((sum, r) => sum + r.rating, 0) / currentRatings.length
                                : null;

                            return (
                                <TableRow key={employee.id}>
                                    <TableCell className="font-medium">{employee.name}</TableCell>
                                    <TableCell>{employee.position ?? '-'}</TableCell>

                                    {/* CAMPS Rating Cells */}
                                    {Object.values(CampsCategory).map(category => {
                                        const rating = currentRatings.find(r => r.category === category)?.rating;
                                        return (
                                            <TableCell key={category} className="text-center">
                                                {rating ? (
                                                    <Badge
                                                        variant={rating >= 7 ? "default" : rating >= 4 ? "secondary" : "destructive"}>
                                                        {rating}
                                                    </Badge>
                                                ) : (
                                                    <span
                                                        className="text-xs text-muted-foreground">N/A</span>
                                                )}
                                            </TableCell>
                                        );
                                    })}

                                    {/* Average Rating */}
                                    <TableCell className="text-center">
                                        {avgRating ? (
                                            <Badge
                                                variant={avgRating >= 7 ? "default" : avgRating >= 4 ? "secondary" : "destructive"}>
                                                {avgRating.toFixed(1)}
                                            </Badge>
                                        ) : (
                                            <span
                                                className="text-xs text-muted-foreground">N/A</span>
                                        )}
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <Link
                                            to={`/employee/${employee.id}`}
                                            className="flex items-center justify-end gap-1 text-sm text-primary hover:underline"
                                        >
                                            Details
                                            <ChevronRight className="h-4 w-4"/>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">No team members found.</p>
                </div>
            )}
        </CardContent>;
    }

    function renderNeedsImprovementCard() {
        return <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500"/>
                    Needs Improvement
                </CardTitle>
            </CardHeader>
            <CardContent>
                {insights?.needsImprovement.map(category => {
                    const changeValue = category.weekOverWeekChange ?? category.change ?? null;
                    return (
                        <div key={category.category} className="mb-4 last:mb-0">
                            <div className="flex justify-between mb-1">
                                <span className="font-medium">{CAMPS_CATEGORIES[category.category].name}</span>
                                <div className="flex flex-col items-end">
                                    <span className="font-medium">{category.averageRating.toFixed(1)}/10</span>
                                    {changeValue !== null && (
                                        <span className={`text-xs flex items-center ${getChangeColorClass(changeValue)}`}>
                                            {changeValue > 0 ? <ArrowUpIcon className="h-3 w-3 mr-1"/> : 
                                             changeValue < 0 ? <ArrowDownIcon className="h-3 w-3 mr-1"/> : null}
                                            {formatChangeValue(changeValue, true)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5">
                                <div
                                    className="bg-amber-500 h-2.5 rounded-full transition-all duration-300"
                                    style={{width: `${Math.min(100, Math.max(0, category.averageRating * 10))}%`}}
                                ></div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {CAMPS_CATEGORIES[category.category].description}
                            </p>
                        </div>
                    );
                })}
            </CardContent>
        </Card>;
    }

    function renderMostImprovedCategories() {
        return <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500"/>
                    Most Improved
                </CardTitle>
            </CardHeader>
            <CardContent>
                {insights?.mostImproved.length ? (
                    insights.mostImproved.map(category => {
                        const changeValue = category.weekOverWeekChange ?? category.change ?? 0;
                        return (
                            <div key={category.category} className="mb-4 last:mb-0">
                                <div className="flex justify-between mb-1">
                                    <span className="font-medium">{CAMPS_CATEGORIES[category.category].name}</span>
                                    <span className="text-green-600 flex items-center">
                                        <ArrowUpIcon className="h-3 w-3 mr-1"/>
                                        {formatChangeValue(changeValue, true)}
                                    </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2.5">
                                    <div
                                        className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
                                        style={{width: `${Math.min(100, Math.max(0, category.averageRating * 10))}%`}}
                                    ></div>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    Current: {category.averageRating.toFixed(1)}/10
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-muted-foreground text-sm">No improvements in the current period.</p>
                )}
            </CardContent>
        </Card>;
    }

    function renderDecliningAreasCard() {
        return <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-red-500"/>
                    Declining Areas
                </CardTitle>
            </CardHeader>
            <CardContent>
                {insights?.declining.length ? (
                    insights.declining.map(category => {
                        const changeValue = category.weekOverWeekChange ?? category.change ?? 0;
                        return (
                            <div key={category.category} className="mb-4 last:mb-0">
                                <div className="flex justify-between mb-1">
                                    <span className="font-medium">{CAMPS_CATEGORIES[category.category].name}</span>
                                    <span className="text-red-600 flex items-center">
                                        <ArrowDownIcon className="h-3 w-3 mr-1"/>
                                        {formatChangeValue(changeValue, false)}
                                    </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2.5">
                                    <div
                                        className="bg-red-500 h-2.5 rounded-full transition-all duration-300"
                                        style={{width: `${Math.min(100, Math.max(0, category.averageRating * 10))}%`}}
                                    ></div>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    Current: {category.averageRating.toFixed(1)}/10
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-muted-foreground text-sm">No declining metrics in the current period.</p>
                )}
            </CardContent>
        </Card>;
    }

    function renderTrendsForCategory() {
        return <Card>
            <CardHeader>
                <CardTitle>
                    {CAMPS_CATEGORIES[selectedCategory].name} Trend
                </CardTitle>
                <CardDescription>
                    {CAMPS_CATEGORIES[selectedCategory].description}
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
                {trendsLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <p>Loading trends...</p>
                    </div>
                ) : trendsError ? (
                    <div className="h-full flex flex-col items-center justify-center gap-2 text-destructive">
                        <AlertTriangle className="h-8 w-8"/>
                        <p className="text-sm">Error loading trend data</p>
                        <p className="text-xs text-muted-foreground">{trendsError.message}</p>
                    </div>
                ) : trendChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendChartData}>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="date"/>
                            <YAxis domain={[0, 10]}/>
                            <Tooltip/>
                            <Legend/>
                            <Line
                                type="monotone"
                                dataKey="value"
                                name={CAMPS_CATEGORIES[selectedCategory].name}
                                stroke="#8884d8"
                                activeDot={{r: 8}}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <p>No trend data available for this period.</p>
                    </div>
                )}
            </CardContent>
        </Card>;
    }

    function renderMonthlyChangesForCategory() {
        return <Card>
            <CardHeader>
                <CardTitle>Monthly Changes</CardTitle>
                <CardDescription>
                    Month-over-month changes for {CAMPS_CATEGORIES[selectedCategory].name}
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                {trendsLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <p>Loading trends...</p>
                    </div>
                ) : trendsError ? (
                    <div className="h-full flex flex-col items-center justify-center gap-2 text-destructive">
                        <AlertTriangle className="h-8 w-8"/>
                        <p className="text-sm">Error loading trend data</p>
                        <p className="text-xs text-muted-foreground">{trendsError.message}</p>
                    </div>
                ) : trendChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trendChartData}>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="date"/>
                            <YAxis/>
                            <Tooltip/>
                            <Legend/>
                            <Bar
                                dataKey="change"
                                name="Monthly Change"
                                fill="#8884d8" // Default fill color
                            >
                                {trendChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fillColor}/>
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <p>No change data available for this period.</p>
                    </div>
                )}
            </CardContent>
        </Card>;
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header with team info */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">{teamData?.team?.name}</h1>
                        <p className="text-muted-foreground">{teamData?.team?.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-muted-foreground"/>
                        <span className="font-medium">{teamData?.team?.members?.length ?? 0} team members</span>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {averagesData?.teamAverages?.map(avg => {
                        // Use weekOverWeekChange if available, fallback to change, then null
                        const changeValue = avg.weekOverWeekChange ?? avg.change ?? null;
                        const hasChange = changeValue !== null && changeValue !== undefined;
                        
                        return (
                            <Card key={avg.category}
                                  className={getCardBorderClass(changeValue)}>
                                <CardContent className="pt-6">
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-3xl font-bold">{avg.averageRating.toFixed(1)}</span>
                                        <span className="text-sm font-medium">{CAMPS_CATEGORIES[avg.category].name}</span>
                                        {hasChange ? (
                                            <div className={`flex items-center gap-1 text-xs ${getChangeColorClass(changeValue)}`}>
                                                {changeValue > 0 ? <ArrowUpIcon className="h-3 w-3"/> : 
                                                 changeValue < 0 ? <ArrowDownIcon className="h-3 w-3"/> : null}
                                                <span>{formatChangeValue(changeValue, false)}</span>
                                            </div>
                                        ) : (
                                            <div className="text-xs text-muted-foreground">
                                                No change data
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Dashboard Tabs */}
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid grid-cols-3 md:w-[400px]">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="trends">Trends</TabsTrigger>
                        <TabsTrigger value="members">Team Members</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        {/* CAMPS Rating Visualization */}
                        <Card>
                            <CardHeader>
                                <CardTitle>CAMPS Rating Overview</CardTitle>
                                <CardDescription>
                                    Team performance across all CAMPS categories
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                {averagesLoading ? (
                                    <div className="h-full flex items-center justify-center">
                                        <p>Loading data...</p>
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart outerRadius={90} data={radarChartData}>
                                            <PolarGrid/>
                                            <PolarAngleAxis dataKey="category"/>
                                            <PolarRadiusAxis domain={[0, 10]}/>
                                            <Radar
                                                name="Team Rating"
                                                dataKey="value"
                                                stroke="#8884d8"
                                                fill="#8884d8"
                                                fillOpacity={0.6}
                                            />
                                            <Tooltip/>
                                        </RadarChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>

                        {/* Insights Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Needs Improvement */}
                            {renderNeedsImprovementCard()}

                            {/* Most Improved */}
                            {renderMostImprovedCategories()}

                            {/* Declining */}
                            {renderDecliningAreasCard()}
                        </div>
                    </TabsContent>

                    {/* Trends Tab */}
                    <TabsContent value="trends" className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="flex gap-2 items-center">
                                <span className="text-sm font-medium">Category:</span>
                                <select
                                    className="p-2 rounded-md border bg-background"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value as CampsCategory)}
                                >
                                    {Object.entries(CAMPS_CATEGORIES).map(([value, {name}]) => (
                                        <option key={value} value={value}>{name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-2 items-center">
                                <span className="text-sm font-medium">Time Period:</span>
                                <select
                                    className="p-2 rounded-md border bg-background"
                                    value={timePeriod}
                                    onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
                                >
                                    <option value={TimePeriod.LAST_30_DAYS}>Last 30 Days</option>
                                    <option value={TimePeriod.LAST_90_DAYS}>Last 90 Days</option>
                                    <option value={TimePeriod.LAST_6_MONTHS}>Last 6 Months</option>
                                    <option value={TimePeriod.LAST_YEAR}>Last Year</option>
                                </select>
                            </div>
                        </div>

                        {renderTrendsForCategory()}

                        {renderMonthlyChangesForCategory()}
                    </TabsContent>

                    {/* Team Members Tab */}
                    <TabsContent value="members" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Team Members</CardTitle>
                                <CardDescription>
                                    Overview of all team members and their current CAMPS ratings
                                </CardDescription>
                            </CardHeader>
                            {getTeamMemberAverages()}
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
};

export default TeamDashboard;

