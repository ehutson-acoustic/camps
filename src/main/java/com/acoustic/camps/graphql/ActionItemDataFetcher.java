package com.acoustic.camps.graphql;

import com.acoustic.camps.codegen.types.ActionItem;
import com.acoustic.camps.codegen.types.ActionItemInput;
import com.acoustic.camps.codegen.types.ActionStatus;
import com.acoustic.camps.codegen.types.DateRangeInput;
import com.acoustic.camps.model.ActionItemModel;
import com.acoustic.camps.model.EmployeeModel;
import com.acoustic.camps.service.ActionItemService;
import com.acoustic.camps.service.EmployeeService;
import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * GraphQL fetchers for ActionItem queries and mutations
 */
@DgsComponent
@RequiredArgsConstructor
public class ActionItemDataFetcher {

    private final ActionItemService actionItemService;
    private final EmployeeService employeeService;

    @DgsQuery
    public List<ActionItem> actionItems(
            @InputArgument String employeeId,
            @InputArgument ActionStatus status,
            @InputArgument DateRangeInput dateRange) {

        if (employeeId != null) {
            if (status != null) {
                return actionItemService.getActionItemsByEmployeeAndStatus(
                        UUID.fromString(employeeId), List.of(status));
            } else {
                return actionItemService.getActionItemsByEmployeeId(UUID.fromString(employeeId));
            }
        }

        if (status != null) {
            return actionItemService.getActionItemsByStatus(status);
        }

        if (dateRange != null) {
            return actionItemService.getActionItemsByDateRange(
                    dateRange.getFromDate(), dateRange.getToDate());
        }

        return actionItemService.getAllActionItems();
    }

    @DgsMutation
    public ActionItem createActionItem(@InputArgument ActionItemInput input) {
        EmployeeModel employeeModel = employeeService.getEmployeeModelById(UUID.fromString(input.getEmployeeId()))
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        ActionItemModel actionItemModel = ActionItemModel.builder()
                .employee(employeeModel)
                .category(input.getCategory())
                .description(input.getDescription())
                .createdDate(input.getCreatedDate())
                .dueDate(input.getDueDate())
                .status(input.getStatus())
                .build();

        return actionItemService.createActionItem(actionItemModel);
    }

    @DgsMutation
    public ActionItem updateActionItem(@InputArgument String id, @InputArgument ActionItemInput input) {
        EmployeeModel employeeModel = employeeService.getEmployeeModelById(UUID.fromString(input.getEmployeeId()))
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        ActionItemModel actionItemModel = ActionItemModel.builder()
                .employee(employeeModel)
                .category(input.getCategory())
                .description(input.getDescription())
                .createdDate(input.getCreatedDate())
                .dueDate(input.getDueDate())
                .status(input.getStatus())
                .build();

        return actionItemService.updateActionItem(UUID.fromString(id), actionItemModel);
    }

    @DgsMutation
    public ActionItem completeActionItem(
            @InputArgument String id,
            @InputArgument LocalDate completedDate,
            @InputArgument String outcome,
            @InputArgument Integer ratingImpact) {

        return actionItemService.completeActionItem(
                UUID.fromString(id), completedDate, outcome, ratingImpact);
    }

    @DgsMutation
    public ActionItem cancelActionItem(@InputArgument String id, @InputArgument String reason) {
        return actionItemService.cancelActionItem(UUID.fromString(id), reason);
    }

    @DgsMutation
    public boolean deleteActionItem(@InputArgument String id) {
        try {
            actionItemService.deleteActionItem(UUID.fromString(id));
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}