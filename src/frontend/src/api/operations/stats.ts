// src/api/operations/stats.ts
import {gql} from '@apollo/client';
import {CampsCategory, CategoryAverage, DateRangeInput, TeamStats, TimePeriod, TrendData} from '@/types/schema.ts';
import {EMPLOYEE_FIELDS, TEAM_FIELDS} from '@/api';

// Fragments
export const TEAM_STATS_FIELDS = gql`
    fragment TeamStatsFields on TeamStats {
        id
        team {
            ...TeamFields
        }
        recordDate
        category
        averageRating
        previousAverageRating
        employeeCount
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
    }
`;

export const TREND_DATA_FIELDS = gql`
    fragment TrendDataFields on TrendData {
        id
        recordDate
        category
        averageRating
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
    query GetTeamStats($teamId: ID!, $dateRange: DateRangeInput) {
        teamStats(teamId: $teamId, dateRange: $dateRange) {
            ...TeamStatsFields
        }
    }
    ${TEAM_STATS_FIELDS}
`;

export const GET_TEAM_AVERAGES = gql`
    query GetTeamAverages($teamId: ID!, $date: DateTime) {
        teamAverages(teamId: $teamId, date: $date) {
            ...CategoryAverageFields
        }
    }
    ${CATEGORY_AVERAGE_FIELDS}
`;

export const GET_TRENDS = gql`
    query GetTrends(
        $employeeId: ID,
        $teamName: String,
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

// Types for query results and variables
export interface GetTeamStatsData {
    teamStats: TeamStats[];
}

export interface GetTeamStatsVars {
    teamName: string;
    dateRange?: DateRangeInput;
}

export interface GetTeamAveragesData {
    teamAverages: CategoryAverage[];
}

export interface GetTeamAveragesVars {
    teamName: string;
    date?: string;
}

export interface GetTrendsData {
    trends: TrendData[];
}

export interface GetTrendsVars {
    employeeId?: string;
    teamName?: string;
    category?: CampsCategory;
    timePeriod: TimePeriod;
}