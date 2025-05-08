// src/api/operations/rating.ts
import {gql} from '@apollo/client';
import {CampsCategory, DateRangeInput, EngagementRating, EngagementRatingInput} from '@/types/schema.ts';
import {EMPLOYEE_FIELDS} from './employee';

// Fragment for common rating fields
export const RATING_FIELDS = gql`
    fragment RatingFields on EngagementRating {
        id
        ratingDate
        category
        rating
        previousRating
        change
        notes
        createdAt
    }
`;

export const RATING_WITH_EMPLOYEE = gql`
    fragment RatingWithEmployee on EngagementRating {
        ...RatingFields
        employee {
            ...EmployeeFields
        }
        createdBy {
            id
            name
        }
    }
    ${RATING_FIELDS}
    ${EMPLOYEE_FIELDS}
`;

// Queries
export const GET_RATINGS = gql`
    query GetRatings($employeeId: ID, $category: CampsCategory, $dateRange: DateRangeInput) {
        ratings(employeeId: $employeeId, category: $category, dateRange: $dateRange) {
            ...RatingWithEmployee
        }
    }
    ${RATING_WITH_EMPLOYEE}
`;

export const GET_CURRENT_RATINGS = gql`
    query GetCurrentRatings($employeeId: ID) {
        currentRatings(employeeId: $employeeId) {
            ...RatingWithEmployee
        }
    }
    ${RATING_WITH_EMPLOYEE}
`;

// Mutations
export const CREATE_RATING = gql`
    mutation CreateRating($input: EngagementRatingInput!) {
        createRating(input: $input) {
            ...RatingWithEmployee
        }
    }
    ${RATING_WITH_EMPLOYEE}
`;

export const UPDATE_RATING = gql`
    mutation UpdateRating($id: ID!, $input: EngagementRatingInput!) {
        updateRating(id: $id, input: $input) {
            ...RatingWithEmployee
        }
    }
    ${RATING_WITH_EMPLOYEE}
`;

export const DELETE_RATING = gql`
    mutation DeleteRating($id: ID!) {
        deleteRating(id: $id)
    }
`;

export const CREATE_RATINGS_BATCH = gql`
    mutation CreateRatingsBatch($inputs: [EngagementRatingInput!]!) {
        createRatingsBatch(inputs: $inputs) {
            ...RatingWithEmployee
        }
    }
    ${RATING_WITH_EMPLOYEE}
`;

// Types for query results and variables
export interface GetRatingsData {
    ratings: EngagementRating[];
}

export interface GetRatingsVars {
    employeeId?: string;
    category?: CampsCategory;
    dateRange?: DateRangeInput;
}

export interface GetCurrentRatingsData {
    currentRatings: EngagementRating[];
}

export interface GetCurrentRatingsVars {
    employeeId?: string;
}

export interface CreateRatingData {
    createRating: EngagementRating;
}

export interface CreateRatingVars {
    input: EngagementRatingInput;
}

export interface UpdateRatingData {
    updateRating: EngagementRating;
}

export interface UpdateRatingVars {
    id: string;
    input: EngagementRatingInput;
}

export interface DeleteRatingData {
    deleteRating: boolean;
}

export interface DeleteRatingVars {
    id: string;
}

export interface CreateRatingsBatchData {
    createRatingsBatch: EngagementRating[];
}

export interface CreateRatingsBatchVars {
    inputs: EngagementRatingInput[];
}