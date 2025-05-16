package com.acoustic.camps.service;

import com.acoustic.camps.codegen.types.ActionItem;
import com.acoustic.camps.codegen.types.ActionStatus;
import com.acoustic.camps.codegen.types.CampsCategory;
import com.acoustic.camps.mapper.ActionItemMapper;
import com.acoustic.camps.model.ActionItemModel;
import com.acoustic.camps.repository.ActionItemRepository;
import com.acoustic.camps.repository.EngagementRatingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Service for managing action items
 */
@Service
@RequiredArgsConstructor
public class ActionItemService {

    public static final String ACTION_ITEM_NOT_FOUND_WITH_ID = "Action item not found with id: ";

    private final ActionItemRepository actionItemRepository;
    private final EngagementRatingRepository ratingRepository;
    private final ActionItemMapper mapper;

    @Transactional(readOnly = true)
    public List<ActionItem> getAllActionItems() {
        return mapper.toActionItemList(actionItemRepository.findAll());
    }

    @Transactional(readOnly = true)
    public List<ActionItem> getActionItemsByEmployeeId(UUID employeeId) {
        return mapper.toActionItemList(actionItemRepository.findByEmployeeOrderByCreatedDateDesc(employeeId));
    }

    @Transactional(readOnly = true)
    public List<ActionItem> getActionItemsByStatus(ActionStatus status) {
        return mapper.toActionItemList(actionItemRepository.findByStatusOrderByDueDateAsc(status));
    }

    @Transactional(readOnly = true)
    public List<ActionItem> getActionItemsByCategory(CampsCategory category) {
        return mapper.toActionItemList(actionItemRepository.findByCategoryOrderByCreatedDateDesc(category));
    }

    @Transactional
    public ActionItem createActionItem(ActionItemModel actionItemModel) {
        return mapper.toActionItem(actionItemRepository.save(actionItemModel));
    }

    @Transactional
    public ActionItem updateActionItem(UUID id, ActionItemModel updatedItem) {
        return actionItemRepository.findById(id)
                .map(item -> {
                    item.setDescription(updatedItem.getDescription());
                    item.setCategory(updatedItem.getCategory());
                    item.setDueDate(updatedItem.getDueDate());
                    item.setStatus(updatedItem.getStatus());
                    // Don't update employee, createdDate, or completedDate
                    return mapper.toActionItem(actionItemRepository.save(item));
                })
                .orElseThrow(() -> new IllegalArgumentException(ACTION_ITEM_NOT_FOUND_WITH_ID + id));
    }

    @Transactional
    public ActionItem completeActionItem(UUID id, OffsetDateTime completedDate, String outcome, Integer ratingImpact) {
        return actionItemRepository.findById(id)
                .map(item -> {
                    item.setStatus(ActionStatus.COMPLETED);
                    item.setCompletedDate(completedDate);
                    item.setOutcome(outcome);
                    item.setRatingImpact(ratingImpact);
                    return mapper.toActionItem(actionItemRepository.save(item));
                })
                .orElseThrow(() -> new IllegalArgumentException(ACTION_ITEM_NOT_FOUND_WITH_ID + id));
    }

    @Transactional
    public ActionItem cancelActionItem(UUID id, String reason) {
        return actionItemRepository.findById(id)
                .map(item -> {
                    item.setStatus(ActionStatus.CANCELLED);
                    item.setOutcome(reason);
                    return mapper.toActionItem(actionItemRepository.save(item));
                })
                .orElseThrow(() -> new IllegalArgumentException(ACTION_ITEM_NOT_FOUND_WITH_ID + id));
    }

    @Transactional
    public void deleteActionItem(UUID id) {
        actionItemRepository.deleteById(id);
    }

    public List<ActionItem> getActionItemsByEmployeeAndStatus(UUID employeeId, List<ActionStatus> statuses) {
        return mapper.toActionItemList(actionItemRepository.findByIdAndStatusIn(employeeId, statuses));
    }

    public List<ActionItem> getActionItemsByDateRange(OffsetDateTime fromDate, OffsetDateTime toDate) {
        return mapper.toActionItemList(actionItemRepository.findByCreatedDateBetweenOrderByCreatedDateDesc(fromDate, toDate));
    }
}