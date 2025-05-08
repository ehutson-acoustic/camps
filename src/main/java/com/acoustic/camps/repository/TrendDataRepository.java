package com.acoustic.camps.repository;

import com.acoustic.camps.codegen.types.CampsCategory;
import com.acoustic.camps.model.TeamModel;
import com.acoustic.camps.model.TrendDataModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Repository for TrendData entity
 */
@Repository
public interface TrendDataRepository extends JpaRepository<TrendDataModel, UUID> {

    /**
     * Find trend data for a specific employee and category
     *
     * @param employeeId Employee ID
     * @param category CAMPS category
     * @return List of trend data ordered by date ascending
     */
    List<TrendDataModel> findByEmployeeIdAndCategoryOrderByRecordDateAsc(
            UUID employeeId, CampsCategory category);

    /**
     * Find trend data for a specific employee, category, and date range
     *
     * @param employeeId Employee ID
     * @param category CAMPS category
     * @param fromDate Start date (inclusive)
     * @param toDate End date (inclusive)
     * @return List of trend data ordered by date ascending
     */
    List<TrendDataModel> findByEmployeeIdAndCategoryAndRecordDateBetweenOrderByRecordDateAsc(
            UUID employeeId, CampsCategory category, LocalDate fromDate, LocalDate toDate);

    /**
     * Find trend data for a specific team and category
     *
     * @param team The team
     * @param category CAMPS category
     * @return List of trend data ordered by date ascending
     */
    List<TrendDataModel> findByTeamAndCategoryOrderByRecordDateAsc(
            TeamModel team, CampsCategory category);

    /**
     * Find trend data for a specific team, category, and date range
     *
     * @param team The team
     * @param category CAMPS category
     * @param fromDate Start date (inclusive)
     * @param toDate End date (inclusive)
     * @return List of trend data ordered by date ascending
     */
    List<TrendDataModel> findByTeamAndCategoryAndRecordDateBetweenOrderByRecordDateAsc(
            TeamModel team, CampsCategory category, LocalDate fromDate, LocalDate toDate);

    /**
     * Find organization-wide trends for a specific category and date range
     *
     * @param category CAMPS category
     * @param fromDate Start date (inclusive)
     * @param toDate End date (inclusive)
     * @return List of trend data ordered by date ascending
     */
    @Query("SELECT td FROM TrendDataModel td " +
            "WHERE td.team IS NULL AND td.employee IS NULL " +
            "AND td.category = :category AND td.recordDate BETWEEN :fromDate AND :toDate " +
            "ORDER BY td.recordDate ASC")
    List<TrendDataModel> findOrganizationWideTrends(
            @Param("category") CampsCategory category,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate);

    /**
     * Find teams with the highest improvement rate
     *
     * @param fromDate Start date (inclusive)
     * @param toDate End date (inclusive)
     * @return List of Object arrays with team and average change
     */
    @Query("SELECT td.team, td.category, AVG(td.monthOverMonthChange) as avgChange " +
            "FROM TrendDataModel td " +
            "WHERE td.team IS NOT NULL AND td.recordDate BETWEEN :fromDate AND :toDate " +
            "GROUP BY td.team, td.category " +
            "ORDER BY avgChange DESC")
    List<Object[]> findTeamsWithHighestImprovementRate(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate);
}