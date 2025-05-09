// src/api/hooks/useRatings.ts
import {MutationHookOptions, QueryHookOptions, useMutation, useQuery} from '@apollo/client';
import {
    ADD_RATING,
    AddRatingData,
    AddRatingVars,
    GET_CURRENT_RATINGS,
    GET_RATINGS,
    GetCurrentRatingsData,
    GetCurrentRatingsVars,
    GetRatingsData,
    GetRatingsVars
} from '@/api';

// Query hooks
export const useGetRatings = (
    options?: QueryHookOptions<GetRatingsData, GetRatingsVars>
) => {
    return useQuery<GetRatingsData, GetRatingsVars>(GET_RATINGS, options);
};

export const useGetCurrentRatings = (
    options?: QueryHookOptions<GetCurrentRatingsData, GetCurrentRatingsVars>
) => {
    return useQuery<GetCurrentRatingsData, GetCurrentRatingsVars>(GET_CURRENT_RATINGS, options);
};

// Mutation hooks
export const useAddRating = (
    options?: MutationHookOptions<AddRatingData, AddRatingVars>
) => {
    return useMutation<AddRatingData, AddRatingVars>(ADD_RATING, options);
};
