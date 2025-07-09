// src/api/hooks/useStats.ts
import {QueryHookOptions, useQuery, useMutation, MutationHookOptions} from '@apollo/client';
import {
    GET_TEAM_AVERAGES,
    GET_TEAM_STATS,
    GET_TRENDS,
    GET_EMPLOYEE_TRENDS,
    GET_TEAM_TRENDS,
    RECALCULATE_TRENDS,
    GetTeamAveragesData,
    GetTeamAveragesVars,
    GetTeamStatsData,
    GetTeamStatsVars,
    GetTrendsData,
    GetTrendsVars,
    GetEmployeeTrendsData,
    GetEmployeeTrendsVars,
    GetTeamTrendsData,
    GetTeamTrendsVars,
    RecalculateTrendsData,
    RecalculateTrendsVars
} from '@/api';
import { TrendData, EmployeeTrendData, TeamTrendData, TeamStats, CategoryAverage, CalculationResult, TimePeriod } from '@/types/schema';

// Enhanced hook return types
export interface UseGetTeamStatsReturn {
    teamStats: TeamStats[];
    hasError: boolean;
    isLoadingTeamStats: boolean;
    refetchTeamStats: () => void;
    loading: boolean;
    error?: Error;
    data?: GetTeamStatsData;
}

export interface UseGetTeamAveragesReturn {
    teamAverages: CategoryAverage[];
    hasError: boolean;
    isLoadingTeamAverages: boolean;
    refetchTeamAverages: () => void;
    loading: boolean;
    error?: Error;
    data?: GetTeamAveragesData;
}

export interface UseGetTrendsReturn {
    trends: TrendData[];
    hasError: boolean;
    isLoadingTrends: boolean;
    refetchTrends: () => void;
    loading: boolean;
    error?: Error;
    data?: GetTrendsData;
}

export interface UseGetEmployeeTrendsReturn {
    employeeTrends: EmployeeTrendData[];
    hasError: boolean;
    isLoadingEmployeeTrends: boolean;
    refetchEmployeeTrends: () => void;
    loading: boolean;
    error?: Error;
    data?: GetEmployeeTrendsData;
}

export interface UseGetTeamTrendsReturn {
    teamTrends: TeamTrendData[];
    hasError: boolean;
    isLoadingTeamTrends: boolean;
    refetchTeamTrends: () => void;
    loading: boolean;
    error?: Error;
    data?: GetTeamTrendsData;
}

export interface UseRecalculateTrendsReturn {
    recalculateTrends: (variables?: { variables?: RecalculateTrendsVars }) => Promise<void>;
    result?: CalculationResult;
    hasError: boolean;
    isRecalculating: boolean;
    loading: boolean;
    error?: Error;
    data?: RecalculateTrendsData;
}

// Query hooks
export const useGetTeamStats = (
    options?: QueryHookOptions<GetTeamStatsData, GetTeamStatsVars>
): UseGetTeamStatsReturn => {
    const query = useQuery<GetTeamStatsData, GetTeamStatsVars>(GET_TEAM_STATS, {
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: true,
        ...options
    });
    
    return {
        ...query,
        teamStats: query.data?.teamStats || [],
        hasError: !!query.error,
        isLoadingTeamStats: query.loading,
        refetchTeamStats: query.refetch
    };
};

export const useGetTeamAverages = (
    options?: QueryHookOptions<GetTeamAveragesData, GetTeamAveragesVars>
): UseGetTeamAveragesReturn => {
    const query = useQuery<GetTeamAveragesData, GetTeamAveragesVars>(GET_TEAM_AVERAGES, {
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: true,
        ...options
    });
    
    return {
        ...query,
        teamAverages: query.data?.teamAverages || [],
        hasError: !!query.error,
        isLoadingTeamAverages: query.loading,
        refetchTeamAverages: query.refetch
    };
};

export const useGetTrends = (
    options?: QueryHookOptions<GetTrendsData, GetTrendsVars>
): UseGetTrendsReturn => {
    const query = useQuery<GetTrendsData, GetTrendsVars>(GET_TRENDS, {
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: true,
        ...options
    });
    
    return {
        ...query,
        trends: query.data?.trends || [],
        hasError: !!query.error,
        isLoadingTrends: query.loading,
        refetchTrends: query.refetch
    };
};

// Enhanced trend hooks
export const useGetEmployeeTrends = (
    options?: QueryHookOptions<GetEmployeeTrendsData, GetEmployeeTrendsVars>
): UseGetEmployeeTrendsReturn => {
    const query = useQuery<GetEmployeeTrendsData, GetEmployeeTrendsVars>(GET_EMPLOYEE_TRENDS, {
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: true,
        ...options
    });
    
    return {
        ...query,
        employeeTrends: query.data?.employeeTrends || [],
        hasError: !!query.error,
        isLoadingEmployeeTrends: query.loading,
        refetchEmployeeTrends: query.refetch
    };
};

export const useGetTeamTrends = (
    options?: QueryHookOptions<GetTeamTrendsData, GetTeamTrendsVars>
): UseGetTeamTrendsReturn => {
    const query = useQuery<GetTeamTrendsData, GetTeamTrendsVars>(GET_TEAM_TRENDS, {
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: true,
        ...options
    });
    
    return {
        ...query,
        teamTrends: query.data?.teamTrends || [],
        hasError: !!query.error,
        isLoadingTeamTrends: query.loading,
        refetchTeamTrends: query.refetch
    };
};

// Admin mutation hooks
export const useRecalculateTrends = (
    options?: MutationHookOptions<RecalculateTrendsData, RecalculateTrendsVars>
): UseRecalculateTrendsReturn => {
    const [mutate, mutation] = useMutation<RecalculateTrendsData, RecalculateTrendsVars>(
        RECALCULATE_TRENDS,
        {
            errorPolicy: 'all',
            ...options
        }
    );
    
    return {
        recalculateTrends: mutate,
        ...mutation,
        result: mutation.data?.recalculateWeeklyTrends,
        hasError: !!mutation.error,
        isRecalculating: mutation.loading
    };
};

// Utility hooks for better data handling
export const useStatsWithErrorHandling = (
    teamId: string,
    options?: {
        includeTeamAverages?: boolean;
        includeTeamStats?: boolean;
        includeTrends?: boolean;
        timePeriod?: string;
    }
) => {
    const { includeTeamAverages = true, includeTeamStats = true, includeTrends = true } = options || {};
    
    const teamAverages = useGetTeamAverages({
        variables: { teamId },
        skip: !includeTeamAverages
    });
    
    const teamStats = useGetTeamStats({
        variables: { teamId },
        skip: !includeTeamStats
    });
    
    const trends = useGetTrends({
        variables: { 
            teamId,
            timePeriod: (options?.timePeriod as TimePeriod) || TimePeriod.LAST_30_DAYS
        },
        skip: !includeTrends
    });
    
    const hasAnyError = teamAverages.hasError || teamStats.hasError || trends.hasError;
    const isAnyLoading = teamAverages.isLoadingTeamAverages || teamStats.isLoadingTeamStats || trends.isLoadingTrends;
    
    return {
        teamAverages: teamAverages.teamAverages,
        teamStats: teamStats.teamStats,
        trends: trends.trends,
        hasError: hasAnyError,
        isLoading: isAnyLoading,
        refetchAll: () => {
            teamAverages.refetchTeamAverages();
            teamStats.refetchTeamStats();
            trends.refetchTrends();
        }
    };
};