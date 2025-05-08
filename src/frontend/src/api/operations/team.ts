// src/api/operations/team.ts
import {gql} from '@apollo/client';
import {Team, TeamInput} from '@/types/schema';

// Fragment for common team fields
export const TEAM_FIELDS = gql`
    fragment TeamFields on Team {
        id
        name
        description
    }
`;

export const TEAM_WITH_MEMBERS = gql`
    fragment TeamWithMembers on Team {
        ...TeamFields
        members {
            id
            name
            position
            department
        }
    }
    ${TEAM_FIELDS}
`;

// Queries
export const GET_TEAMS = gql`
    query GetTeams {
        teams {
            ...TeamFields
        }
    }
    ${TEAM_FIELDS}
`;

export const GET_TEAM = gql`
    query GetTeam($teamId: ID!) {
        team(teamId: $teamId) {
            ...TeamWithMembers
        }
    }
    ${TEAM_WITH_MEMBERS}
`;

// Mutations
export const CREATE_TEAM = gql`
    mutation CreateTeam($input: TeamInput!) {
        createTeam(input: $input) {
            ...TeamFields
        }
    }
    ${TEAM_FIELDS}
`;

export const UPDATE_TEAM = gql`
    mutation UpdateTeam($id: ID!, $input: TeamInput!) {
        updateTeam(id: $id, input: $input) {
            ...TeamFields
        }
    }
    ${TEAM_FIELDS}
`;

export const DELETE_TEAM = gql`
    mutation DeleteTeam($id: ID!) {
        deleteTeam(id: $id)
    }
`;

// Types for query results and variables
export interface GetTeamsData {
    teams: Team[];
}

export interface GetTeamData {
    team: Team;
}

export interface GetTeamVars {
    teamId: string;
}

export interface CreateTeamData {
    createTeam: Team;
}

export interface CreateTeamVars {
    input: TeamInput;
}

export interface UpdateTeamData {
    updateTeam: Team;
}

export interface UpdateTeamVars {
    id: string;
    input: TeamInput;
}

export interface DeleteTeamData {
    deleteTeam: boolean;
}

export interface DeleteTeamVars {
    id: string;
}