// src/api/operations/stats.ts
import {gql} from '@apollo/client';
import {CampsCategory, CategoryAverage, DateRangeInput, TeamStats, TimePeriod, TrendData, AggregationPeriod, TrendAnalysisInput, EmployeeTrendData, TeamTrendData, CalculationResult} from '@/types/schema.ts';
import {EMPLOYEE_FIELDS, TEAM_FIELDS} from '@/api';

// Fragments
export const TEAM_STATS_FIELDS = gql`
    fragment TeamStatsFields on TeamStats {
        id
        team {
            ...TeamFields
        }
        recordDate
        aggregationPeriod
        category
        averageRating
        statisticalContext {
            sampleSize
            standardDeviation
            variance
            confidenceInterval
            isStatisticallySignificant
            significanceLevel
        }
        weekOverWeekChange
        monthOverMonthChange
        employeeCount
        participationRate
        createdAt
    }
    ${TEAM_FIELDS}
`;

export const CATEGORY_AVERAGE_FIELDS = gql`
    fragment CategoryAverageFields on CategoryAverage {
        category
        averageRating
        previousAverageRating
        change
        weekOverWeekChange
        statisticalContext {
            sampleSize
            standardDeviation
            variance
            confidenceInterval
            isStatisticallySignificant
            significanceLevel
        }
        rollingAverages {
            fourWeekAverage
            twelveWeekAverage
            sixMonthAverage
        }
        volatilityIndicators {
            volatilityScore
            stabilityRating
            trendDirection
            seasonalityDetected
        }

    }
`;

export const TREND_DATA_FIELDS = gql`
    fragment TrendDataFields on TrendData {
        id
        recordDate
        category
        averageRating
        weekOverWeekChange
        monthOverMonthChange
        quarterOverQuarterChange
        yearOverYearChange
        team {
            ...TeamFields
        }
        employee {
            ...EmployeeFields
        }
    }
    ${TEAM_FIELDS}
    ${EMPLOYEE_FIELDS}
`;

// Queries
export const GET_TEAM_STATS = gql`
    query GetTeamStats(
        $teamId: ID!,
        $dateRange: DateRangeInput,
        $aggregationPeriod: AggregationPeriod = WEEKLY,
        $trendAnalysis: TrendAnalysisInput
    ) {
        teamStats(
            teamId: $teamId,
            dateRange: $dateRange,
            aggregationPeriod: $aggregationPeriod,
            trendAnalysis: $trendAnalysis
        ) {
            ...TeamStatsFields
        }
    }
    ${TEAM_STATS_FIELDS}
`;

export const GET_TEAM_AVERAGES = gql`
    query GetTeamAverages($teamId: ID!, $date: DateTime, $includeStatisticalContext: Boolean = true) {
        teamAverages(teamId: $teamId, date: $date, includeStatisticalContext: $includeStatisticalContext) {
            ...CategoryAverageFields
        }
    }
    ${CATEGORY_AVERAGE_FIELDS}
`;

export const GET_TRENDS = gql`
    query GetTrends(
        $employeeId: ID,
        $teamId: ID,
        $category: CampsCategory,
        $timePeriod: TimePeriod!
    ) {
        trends(
            employeeId: $employeeId,
            teamId: $teamId,
            category: $category,
            timePeriod: $timePeriod
        ) {
            ...TrendDataFields
        }
    }
    ${TREND_DATA_FIELDS}
`;

// Enhanced trend queries
export const GET_EMPLOYEE_TRENDS = gql`
    query GetEmployeeTrends(
        $employeeId: ID!,
        $category: CampsCategory,
        $timePeriod: TimePeriod!,
        $dateRange: DateRangeInput,
        $trendAnalysis: TrendAnalysisInput
    ) {
        employeeTrends(
            employeeId: $employeeId,
            category: $category,
            timePeriod: $timePeriod,
            dateRange: $dateRange,
            trendAnalysis: $trendAnalysis
        ) {
            id
            employee {
                ...EmployeeFields
            }
            recordDate
            aggregationPeriod
            category
            averageRating
            weekOverWeekChange
            monthOverMonthChange
            quarterOverQuarterChange
            yearOverYearChange
            statisticalContext {
                sampleSize
                standardDeviation
                variance
                confidenceInterval
                isStatisticallySignificant
                significanceLevel
            }
            rollingAverages {
                fourWeekAverage
                twelveWeekAverage
                sixMonthAverage
            }
            volatilityIndicators {
                volatilityScore
                stabilityRating
                trendDirection
                seasonalityDetected
            }
            createdAt
            calculatedAt
        }
    }
    ${EMPLOYEE_FIELDS}
`;

export const GET_TEAM_TRENDS = gql`
    query GetTeamTrends(
        $teamId: ID!,
        $category: CampsCategory,
        $timePeriod: TimePeriod!,
        $dateRange: DateRangeInput,
        $trendAnalysis: TrendAnalysisInput
    ) {
        teamTrends(
            teamId: $teamId,
            category: $category,
            timePeriod: $timePeriod,
            dateRange: $dateRange,
            trendAnalysis: $trendAnalysis
        ) {
            id
            team {
                ...TeamFields
            }
            recordDate
            aggregationPeriod
            category
            averageRating
            weekOverWeekChange
            monthOverMonthChange
            quarterOverQuarterChange
            yearOverYearChange
            statisticalContext {
                sampleSize
                standardDeviation
                variance
                confidenceInterval
                isStatisticallySignificant
                significanceLevel
            }
            rollingAverages {
                fourWeekAverage
                twelveWeekAverage
                sixMonthAverage
            }
            volatilityIndicators {
                volatilityScore
                stabilityRating
                trendDirection
                seasonalityDetected
            }
            participationRate
            teamSize
            createdAt
            calculatedAt
        }
    }
    ${TEAM_FIELDS}
`;

// Admin mutations
export const RECALCULATE_TRENDS = gql`
    mutation RecalculateTrends($teamId: ID) {
        recalculateWeeklyTrends(teamId: $teamId) {
            success
            message
            calculatedRecords
            errors
        }
    }
`;

// Types for query results and variables
export interface GetTeamStatsData {
    teamStats: TeamStats[];
}

export interface GetTeamStatsVars {
    teamId: string;
    dateRange?: DateRangeInput;
    aggregationPeriod?: AggregationPeriod;
    trendAnalysis?: TrendAnalysisInput;
}

export interface GetTeamAveragesData {
    teamAverages: CategoryAverage[];
}

export interface GetTeamAveragesVars {
    teamId: string;
    date?: string;
    includeStatisticalContext?: boolean;
}

export interface GetTrendsData {
    trends: TrendData[];
}

export interface GetTrendsVars {
    employeeId?: string;
    teamId?: string;
    category?: CampsCategory;
    timePeriod: TimePeriod;
}

export interface GetEmployeeTrendsData {
    employeeTrends: EmployeeTrendData[];
}

export interface GetEmployeeTrendsVars {
    employeeId: string;
    category?: CampsCategory;
    timePeriod: TimePeriod;
    dateRange?: DateRangeInput;
    trendAnalysis?: TrendAnalysisInput;
}

export interface GetTeamTrendsData {
    teamTrends: TeamTrendData[];
}

export interface GetTeamTrendsVars {
    teamId: string;
    category?: CampsCategory;
    timePeriod: TimePeriod;
    dateRange?: DateRangeInput;
    trendAnalysis?: TrendAnalysisInput;
}

export interface RecalculateTrendsData {
    recalculateWeeklyTrends: CalculationResult;
}

export interface RecalculateTrendsVars {
    teamId?: string;
}