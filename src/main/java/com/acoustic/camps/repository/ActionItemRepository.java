package com.acoustic.camps.repository;

import com.acoustic.camps.codegen.types.ActionStatus;
import com.acoustic.camps.codegen.types.CampsCategory;
import com.acoustic.camps.model.ActionItemModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Repository for ActionItem entity
 */
@Repository
public interface ActionItemRepository extends JpaRepository<ActionItemModel, UUID> {

    /**
     * Find all action items for a specific employee, ordered by created date in descending order
     *
     * @param employeeId The employee's ID
     * @return List of ActionItemModel objects
     */
    @Query("SELECT ai FROM ActionItemModel ai " +
            "WHERE ai.employee.id = :employeeId " +
            "ORDER BY ai.createdDate DESC")
    List<ActionItemModel> findByEmployeeOrderByCreatedDateDesc(@Param("employeeId") UUID employeeId);

    /**
     * Find all action items by status, ordered by due date in ascending order
     *
     * @param status The status to filter by
     * @return List of ActionItemModel objects
     */
    List<ActionItemModel> findByStatusOrderByDueDateAsc(ActionStatus status);

    /**
     * Find all action items for a specific category, ordered by created date in descending order
     *
     * @param category The CAMPS category
     * @return List of ActionItemModel objects
     */
    List<ActionItemModel> findByCategoryOrderByCreatedDateDesc(CampsCategory category);

    /**
     * Find all action items for a specific employee and status
     *
     * @param employeeId The employee's ID
     * @param statuses   List of action statuses to filter by
     * @return List of ActionItemModel objects
     */
    List<ActionItemModel> findByIdAndStatusIn(
            UUID employeeId, List<ActionStatus> statuses);

    /**
     * Find all action items with a due date before a specific date and status in a list
     *
     * @param date     The date to compare against
     * @param statuses List of action statuses to filter by
     * @return List of ActionItemModel objects
     */
    List<ActionItemModel> findByDueDateBeforeAndStatusIn(
            OffsetDateTime date, List<ActionStatus> statuses);

    /**
     * Find all action items for a specific team and status, ordered by due date in ascending order
     *
     * @param teamId   The team's ID
     * @param statuses List of action statuses to filter by
     * @return List of ActionItemModel objects
     */
    @Query("SELECT ai FROM ActionItemModel ai " +
            "JOIN ai.employee e " +
            "WHERE e.team.id = :teamId AND ai.status IN :statuses " +
            "ORDER BY ai.dueDate ASC")
    List<ActionItemModel> findByTeamAndStatusIn(
            @Param("teamId") UUID teamId,
            @Param("statuses") List<ActionStatus> statuses);

    /**
     * Find all action items for a specific employee and category, completed within a date range
     *
     * @param employeeId The employee's ID
     * @param category   The CAMPS category
     * @param fromDate   The start date (inclusive)
     * @param toDate     The end date (inclusive)
     * @return List of ActionItemModel objects
     */
    @Query("SELECT ai FROM ActionItemModel ai " +
            "WHERE ai.employee.id = :employeeId AND ai.category = :category " +
            "AND ai.status = 'COMPLETED' AND ai.completedDate BETWEEN :fromDate AND :toDate")
    List<ActionItemModel> findCompletedActionItemsByEmployeeAndCategory(
            @Param("employeeId") UUID employeeId,
            @Param("category") CampsCategory category,
            @Param("fromDate") OffsetDateTime fromDate,
            @Param("toDate") OffsetDateTime toDate);

    /**
     * Find all action items created within a specific date range, ordered by created date in descending order
     *
     * @param fromDate The start date (inclusive)
     * @param toDate   The end date (inclusive)
     * @return List of ActionItemModel objects
     */
    List<ActionItemModel> findByCreatedDateBetweenOrderByCreatedDateDesc(OffsetDateTime fromDate, OffsetDateTime toDate);
}