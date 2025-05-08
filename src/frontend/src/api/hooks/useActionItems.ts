// src/api/hooks/useActionItems.ts
import {MutationHookOptions, QueryHookOptions, useMutation, useQuery} from '@apollo/client';
import {
    CANCEL_ACTION_ITEM,
    CancelActionItemData,
    CancelActionItemVars,
    COMPLETE_ACTION_ITEM,
    CompleteActionItemData,
    CompleteActionItemVars,
    CREATE_ACTION_ITEM,
    CreateActionItemData,
    CreateActionItemVars,
    DELETE_ACTION_ITEM,
    DeleteActionItemData,
    DeleteActionItemVars,
    GET_ACTION_ITEMS,
    GetActionItemsData,
    GetActionItemsVars,
    UPDATE_ACTION_ITEM,
    UpdateActionItemData,
    UpdateActionItemVars
} from '@/api';

// Query hooks
export const useGetActionItems = (
    options?: QueryHookOptions<GetActionItemsData, GetActionItemsVars>
) => {
    return useQuery<GetActionItemsData, GetActionItemsVars>(GET_ACTION_ITEMS, options);
};

// Mutation hooks
export const useCreateActionItem = (
    options?: MutationHookOptions<CreateActionItemData, CreateActionItemVars>
) => {
    return useMutation<CreateActionItemData, CreateActionItemVars>(CREATE_ACTION_ITEM, options);
};

export const useUpdateActionItem = (
    options?: MutationHookOptions<UpdateActionItemData, UpdateActionItemVars>
) => {
    return useMutation<UpdateActionItemData, UpdateActionItemVars>(UPDATE_ACTION_ITEM, options);
};

export const useCompleteActionItem = (
    options?: MutationHookOptions<CompleteActionItemData, CompleteActionItemVars>
) => {
    return useMutation<CompleteActionItemData, CompleteActionItemVars>(COMPLETE_ACTION_ITEM, options);
};

export const useCancelActionItem = (
    options?: MutationHookOptions<CancelActionItemData, CancelActionItemVars>
) => {
    return useMutation<CancelActionItemData, CancelActionItemVars>(CANCEL_ACTION_ITEM, options);
};

export const useDeleteActionItem = (
    options?: MutationHookOptions<DeleteActionItemData, DeleteActionItemVars>
) => {
    return useMutation<DeleteActionItemData, DeleteActionItemVars>(DELETE_ACTION_ITEM, options);
};