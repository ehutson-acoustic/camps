package com.acoustic.camps.mapper;

import com.acoustic.camps.codegen.types.ActionItem;
import com.acoustic.camps.codegen.types.Employee;
import com.acoustic.camps.model.ActionItemModel;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class BasicActionItemMapper {

    /**
     * Converts an {@link ActionItemModel} to an {@link ActionItem}.
     *
     * @param actionItemModel the model to convert
     * @return the converted {@link ActionItem}, or {@code null} if the input is {@code null}
     */
    public ActionItem toBasicActionItem(ActionItemModel actionItemModel) {
        if (actionItemModel == null) return null;

        Employee employee = new Employee();
        employee.setId(actionItemModel.getEmployee().getId().toString());
        employee.setName(actionItemModel.getEmployee().getName());

        ActionItem actionItem = new ActionItem();
        actionItem.setId(actionItemModel.getId().toString());
        actionItem.setCategory(actionItemModel.getCategory());
        actionItem.setEmployee(employee);
        actionItem.setCompletedDate(actionItemModel.getCompletedDate());
        actionItem.setCreatedAt(actionItemModel.getCreatedAt());
        actionItem.setCreatedDate(actionItemModel.getCreatedDate());
        actionItem.setDueDate(actionItemModel.getDueDate());
        actionItem.setOutcome(actionItemModel.getOutcome());
        actionItem.setRatingImpact(actionItemModel.getRatingImpact());
        actionItem.setStatus(actionItemModel.getStatus());
        actionItem.setUpdatedAt(actionItemModel.getUpdatedAt());
        actionItem.setDescription(actionItemModel.getDescription());
        return actionItem;
    }

    /**
     * Converts a list of {@link ActionItemModel} objects to a list of {@link ActionItem} objects.
     *
     * @param actionItems the list of models to convert
     * @return a list of converted {@link ActionItem} objects, or an empty list if the input is {@code null}
     */
    public List<ActionItem> toBasicActionItemList(List<ActionItemModel> actionItems) {
        if (actionItems == null) return Collections.emptyList();
        return actionItems.stream()
                .map(this::toBasicActionItem)
                .toList();
    }
}
