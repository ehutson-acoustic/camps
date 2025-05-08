// src/api/hooks/useStats.ts
import {QueryHookOptions, useQuery} from '@apollo/client';
import {
    GET_TEAM_AVERAGES,
    GET_TEAM_STATS,
    GET_TRENDS,
    GetTeamAveragesData,
    GetTeamAveragesVars,
    GetTeamStatsData,
    GetTeamStatsVars,
    GetTrendsData,
    GetTrendsVars
} from '@/api';

// Query hooks
export const useGetTeamStats = (
    options?: QueryHookOptions<GetTeamStatsData, GetTeamStatsVars>
) => {
    return useQuery<GetTeamStatsData, GetTeamStatsVars>(GET_TEAM_STATS, options);
};

export const useGetTeamAverages = (
    options?: QueryHookOptions<GetTeamAveragesData, GetTeamAveragesVars>
) => {
    return useQuery<GetTeamAveragesData, GetTeamAveragesVars>(GET_TEAM_AVERAGES, options);
};

export const useGetTrends = (
    options?: QueryHookOptions<GetTrendsData, GetTrendsVars>
) => {
    return useQuery<GetTrendsData, GetTrendsVars>(GET_TRENDS, options);
};