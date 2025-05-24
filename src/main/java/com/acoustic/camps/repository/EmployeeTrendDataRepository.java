package com.acoustic.camps.repository;

import com.acoustic.camps.codegen.types.CampsCategory;
import com.acoustic.camps.model.EmployeeModel;
import com.acoustic.camps.model.EmployeeTrendDataModel;
import com.acoustic.camps.model.TeamModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for employee trend data operations
 */
@Repository
public interface EmployeeTrendDataRepository extends JpaRepository<EmployeeTrendDataModel, UUID> {

    /**
     * Find trend data for a specific employee and category
     *
     * @param employee The employee
     * @param category CAMPS category
     * @return List of trend data ordered by date ascending
     */
    List<EmployeeTrendDataModel> findByEmployeeAndCategoryOrderByRecordDateAsc(
            EmployeeModel employee, CampsCategory category);

    /**
     * Find trend data for a specific employee, category, and date range
     *
     * @param employee The employee
     * @param category CAMPS category
     * @param fromDate Start date (inclusive)
     * @param toDate   End date (inclusive)
     * @return List of trend data ordered by date ascending
     */
    List<EmployeeTrendDataModel> findByEmployeeAndCategoryAndRecordDateBetweenOrderByRecordDateAsc(
            EmployeeModel employee, CampsCategory category, OffsetDateTime fromDate, OffsetDateTime toDate);

    /**
     * Find the most recent trend record for a specific employee and category
     *
     * @param employee The employee
     * @param category The CAMPS category
     * @return The most recent trend data or empty if none exists
     */
    Optional<EmployeeTrendDataModel> findTopByEmployeeAndCategoryOrderByRecordDateDesc(
            EmployeeModel employee, CampsCategory category);

    /**
     * Find all trend data for employees in a specific team and date range
     *
     * @param team     The team
     * @param fromDate Start date (inclusive)
     * @param toDate   End date (inclusive)
     * @return List of trend data
     */
    List<EmployeeTrendDataModel> findByTeamAndRecordDateBetweenOrderByEmployeeAscRecordDateAsc(
            TeamModel team, OffsetDateTime fromDate, OffsetDateTime toDate);

    /**
     * Find weekly trend data for an employee
     *
     * @param employee The employee
     * @param fromDate Start date (inclusive)
     * @param toDate   End date (inclusive)
     * @return List of weekly trend data
     */
    @Query("SELECT e FROM EmployeeTrendDataModel e WHERE e.employee = :employee " +
            "AND e.recordDate BETWEEN :fromDate AND :toDate " +
            "AND FUNCTION('date_part', 'dow', e.recordDate) = 0 " +
            "ORDER BY e.recordDate ASC")
    List<EmployeeTrendDataModel> findWeeklyDataByEmployee(
            @Param("employee") EmployeeModel employee,
            @Param("fromDate") OffsetDateTime fromDate,
            @Param("toDate") OffsetDateTime toDate);

    /**
     * Get employees with the highest improvement over a period
     *
     * @param category The category to check
     * @param teamId   Optional team ID to filter by (can be null)
     * @param fromDate Start date
     * @param toDate   End date
     * @return List of employee IDs and their improvement values
     */
    @Query("SELECT e.employee.id as employeeId, " +
            "(MAX(CASE WHEN e.recordDate = :toDate THEN e.rating ELSE 0 END) - " +
            "MAX(CASE WHEN e.recordDate = :fromDate THEN e.rating ELSE 0 END)) as improvement " +
            "FROM EmployeeTrendDataModel e " +
            "WHERE e.category = :category " +
            "AND (:teamId IS NULL OR e.team.id = :teamId) " +
            "AND e.recordDate IN (:fromDate, :toDate) " +
            "GROUP BY e.employee.id " +
            "ORDER BY improvement DESC")
    List<Object[]> findEmployeesWithHighestImprovement(
            @Param("category") CampsCategory category,
            @Param("teamId") UUID teamId,
            @Param("fromDate") OffsetDateTime fromDate,
            @Param("toDate") OffsetDateTime toDate);
}