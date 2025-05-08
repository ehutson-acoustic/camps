// src/api/hooks/useTeams.ts
import {MutationHookOptions, QueryHookOptions, useMutation, useQuery,} from '@apollo/client';
import {
    CREATE_TEAM,
    CreateTeamData,
    CreateTeamVars,
    DELETE_TEAM,
    DeleteTeamData,
    DeleteTeamVars,
    GET_TEAM,
    GET_TEAMS,
    GetTeamData,
    GetTeamsData,
    GetTeamVars,
    UPDATE_TEAM,
    UpdateTeamData,
    UpdateTeamVars
} from '@/api';

// Query hooks
export const useGetTeams = (
    options?: QueryHookOptions<GetTeamsData, {}>
) => {
    return useQuery<GetTeamsData, {}>(GET_TEAMS, options);
};

export const useGetTeam = (
    options?: QueryHookOptions<GetTeamData, GetTeamVars>
) => {
    return useQuery<GetTeamData, GetTeamVars>(GET_TEAM, options);
};

// Mutation hooks
export const useCreateTeam = (
    options?: MutationHookOptions<CreateTeamData, CreateTeamVars>
) => {
    return useMutation<CreateTeamData, CreateTeamVars>(
        CREATE_TEAM,
        options
    );
};

export const useUpdateTeam = (
    options?: MutationHookOptions<UpdateTeamData, UpdateTeamVars>
) => {
    return useMutation<UpdateTeamData, UpdateTeamVars>(
        UPDATE_TEAM,
        options
    );
};

export const useDeleteTeam = (
    options?: MutationHookOptions<DeleteTeamData, DeleteTeamVars>
) => {
    return useMutation<DeleteTeamData, DeleteTeamVars>(
        DELETE_TEAM,
        options
    );
};