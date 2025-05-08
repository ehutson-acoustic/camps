// src/api/hooks/useRatings.ts
import {MutationHookOptions, QueryHookOptions, useMutation, useQuery} from '@apollo/client';
import {
    CREATE_RATING,
    CREATE_RATINGS_BATCH,
    CreateRatingData,
    CreateRatingsBatchData,
    CreateRatingsBatchVars,
    CreateRatingVars,
    DELETE_RATING,
    DeleteRatingData,
    DeleteRatingVars,
    GET_CURRENT_RATINGS,
    GET_RATINGS,
    GetCurrentRatingsData,
    GetCurrentRatingsVars,
    GetRatingsData,
    GetRatingsVars,
    UPDATE_RATING,
    UpdateRatingData,
    UpdateRatingVars
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
export const useCreateRating = (
    options?: MutationHookOptions<CreateRatingData, CreateRatingVars>
) => {
    return useMutation<CreateRatingData, CreateRatingVars>(CREATE_RATING, options);
};

export const useUpdateRating = (
    options?: MutationHookOptions<UpdateRatingData, UpdateRatingVars>
) => {
    return useMutation<UpdateRatingData, UpdateRatingVars>(UPDATE_RATING, options);
};

export const useDeleteRating = (
    options?: MutationHookOptions<DeleteRatingData, DeleteRatingVars>
) => {
    return useMutation<DeleteRatingData, DeleteRatingVars>(DELETE_RATING, options);
};

export const useCreateRatingsBatch = (
    options?: MutationHookOptions<CreateRatingsBatchData, CreateRatingsBatchVars>
) => {
    return useMutation<CreateRatingsBatchData, CreateRatingsBatchVars>(CREATE_RATINGS_BATCH, options);
};