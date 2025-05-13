import {gql} from '@apollo/client';
import {CampsCategory, DateRangeInput, EngagementRating, EngagementRatingInput} from '@/types/schema.ts';
import {EMPLOYEE_FIELDS} from '@/api';

// Fragment for common rating fields
export const RATING_FIELDS = gql`
    fragment RatingFields on EngagementRating {
        id
        ratingDate
        category
        rating
        notes
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
export const ADD_RATING = gql`
    mutation CreateRating($input: EngagementRatingInput!) {
        addRating(input: $input) {
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

export interface AddRatingData {
    createRating: EngagementRating;
}

export interface AddRatingVars {
    input: EngagementRatingInput;
}
