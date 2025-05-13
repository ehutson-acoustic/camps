// src/api/operations/action-item.ts
import {gql} from '@apollo/client';
import {ActionItem, ActionItemInput, ActionStatus, DateRangeInput} from '@/types/schema.ts';
import {EMPLOYEE_FIELDS} from '@/api';

// Fragment for common action item fields
export const ACTION_ITEM_FIELDS = gql`
    fragment ActionItemFields on ActionItem {
        id
        description
        category
        createdDate
        dueDate
        completedDate
        status
        outcome
        ratingImpact
        createdAt
        updatedAt
    }
`;

export const ACTION_ITEM_WITH_EMPLOYEE = gql`
    fragment ActionItemWithEmployee on ActionItem {
        ...ActionItemFields
        employee {
            ...EmployeeFields
        }
        createdBy {
            id
            name
        }
    }
    ${ACTION_ITEM_FIELDS}
    ${EMPLOYEE_FIELDS}
`;

// Queries
export const GET_ACTION_ITEMS = gql`
    query GetActionItems($employeeId: ID, $status: ActionStatus, $dateRange: DateRangeInput) {
        actionItems(employeeId: $employeeId, status: $status, dateRange: $dateRange) {
            ...ActionItemWithEmployee
        }
    }
    ${ACTION_ITEM_WITH_EMPLOYEE}
`;

// Mutations
export const CREATE_ACTION_ITEM = gql`
    mutation CreateActionItem($input: ActionItemInput!) {
        createActionItem(input: $input) {
            ...ActionItemWithEmployee
        }
    }
    ${ACTION_ITEM_WITH_EMPLOYEE}
`;

export const UPDATE_ACTION_ITEM = gql`
    mutation UpdateActionItem($id: ID!, $input: ActionItemInput!) {
        updateActionItem(id: $id, input: $input) {
            ...ActionItemWithEmployee
        }
    }
    ${ACTION_ITEM_WITH_EMPLOYEE}
`;

export const COMPLETE_ACTION_ITEM = gql`
    mutation CompleteActionItem($id: ID!, $completedDate: DateTime!, $outcome: String, $ratingImpact: Int) {
        completeActionItem(
            id: $id,
            completedDate: $completedDate,
            outcome: $outcome,
            ratingImpact: $ratingImpact
        ) {
            ...ActionItemWithEmployee
        }
    }
    ${ACTION_ITEM_WITH_EMPLOYEE}
`;

export const CANCEL_ACTION_ITEM = gql`
    mutation CancelActionItem($id: ID!, $reason: String) {
        cancelActionItem(id: $id, reason: $reason) {
            ...ActionItemWithEmployee
        }
    }
    ${ACTION_ITEM_WITH_EMPLOYEE}
`;

export const DELETE_ACTION_ITEM = gql`
    mutation DeleteActionItem($id: ID!) {
        deleteActionItem(id: $id)
    }
`;

// Types for query results and variables
export interface GetActionItemsData {
    actionItems: ActionItem[];
}

export interface GetActionItemsVars {
    employeeId?: string;
    status?: ActionStatus;
    dateRange?: DateRangeInput;
}

export interface CreateActionItemData {
    createActionItem: ActionItem;
}

export interface CreateActionItemVars {
    input: ActionItemInput;
}

export interface UpdateActionItemData {
    updateActionItem: ActionItem;
}

export interface UpdateActionItemVars {
    id: string;
    input: ActionItemInput;
}

export interface CompleteActionItemData {
    completeActionItem: ActionItem;
}

export interface CompleteActionItemVars {
    id: string;
    completedDate: string;
    outcome?: string;
    ratingImpact?: number;
}

export interface CancelActionItemData {
    cancelActionItem: ActionItem;
}

export interface CancelActionItemVars {
    id: string;
    reason?: string;
}

export interface DeleteActionItemData {
    deleteActionItem: boolean;
}

export interface DeleteActionItemVars {
    id: string;
}