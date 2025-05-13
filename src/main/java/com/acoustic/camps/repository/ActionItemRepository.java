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

    @Query("SELECT ai FROM ActionItemModel ai " +
            "WHERE ai.employee.id = :employeeId " +
            "ORDER BY ai.createdDate DESC")
    List<ActionItemModel> findByEmployeeOrderByCreatedDateDesc(@Param("employeeId") UUID employeeId);

    List<ActionItemModel> findByStatusOrderByDueDateAsc(ActionStatus status);

    List<ActionItemModel> findByCategoryOrderByCreatedDateDesc(CampsCategory category);

    List<ActionItemModel> findByIdAndStatusIn(
            UUID employeeId, List<ActionStatus> statuses);

    List<ActionItemModel> findByDueDateBeforeAndStatusIn(
            OffsetDateTime date, List<ActionStatus> statuses);

    @Query("SELECT ai FROM ActionItemModel ai " +
            "JOIN ai.employee e " +
            "WHERE e.team = :teamName AND ai.status IN :statuses " +
            "ORDER BY ai.dueDate ASC")
    List<ActionItemModel> findByTeamAndStatusIn(
            @Param("teamName") String teamName,
            @Param("statuses") List<ActionStatus> statuses);

    @Query("SELECT ai FROM ActionItemModel ai " +
            "WHERE ai.employee.id = :employeeId AND ai.category = :category " +
            "AND ai.status = 'COMPLETED' AND ai.completedDate BETWEEN :fromDate AND :toDate")
    List<ActionItemModel> findCompletedActionItemsByEmployeeAndCategory(
            @Param("employeeId") UUID employeeId,
            @Param("category") CampsCategory category,
            @Param("fromDate") OffsetDateTime fromDate,
            @Param("toDate") OffsetDateTime toDate);

    List<ActionItemModel> findByCreatedDateBetweenOrderByCreatedDateDesc(OffsetDateTime fromDate, OffsetDateTime toDate);
}