package com.acoustic.camps.repository;

import com.acoustic.camps.codegen.types.CampsCategory;
import com.acoustic.camps.model.TeamModel;
import com.acoustic.camps.model.TeamTrendDataModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for team trend data operations
 */
@Repository
public interface TeamTrendDataRepository extends JpaRepository<TeamTrendDataModel, UUID> {

    /**
     * Find trend data for a specific team and category
     *
     * @param team     The team
     * @param category CAMPS category
     * @return List of trend data ordered by date ascending
     */
    List<TeamTrendDataModel> findByTeamAndCategoryOrderByRecordDateAsc(
            TeamModel team, CampsCategory category);

    /**
     * Find trend data for a specific team, category, and date range
     *
     * @param team     The team
     * @param category CAMPS category
     * @param fromDate Start date (inclusive)
     * @param toDate   End date (inclusive)
     * @return List of trend data ordered by date ascending
     */
    List<TeamTrendDataModel> findByTeamAndCategoryAndRecordDateBetweenOrderByRecordDateAsc(
            TeamModel team, CampsCategory category, OffsetDateTime fromDate, OffsetDateTime toDate);

    /**
     * Find the most recent trend record for a specific team and category
     *
     * @param team     The team
     * @param category The CAMPS category
     * @return The most recent trend data or empty if none exists
     */
    Optional<TeamTrendDataModel> findTopByTeamAndCategoryOrderByRecordDateDesc(
            TeamModel team, CampsCategory category);

    /**
     * Find weekly trend data for a team
     *
     * @param team     The team
     * @param fromDate Start date (inclusive)
     * @param toDate   End date (inclusive)
     * @return List of weekly trend data
     */
    @Query("SELECT t FROM TeamTrendDataModel t WHERE t.team = :team " +
            "AND t.recordDate BETWEEN :fromDate AND :toDate " +
            "AND FUNCTION('date_part', 'dow', t.recordDate) = 0 " +
            "ORDER BY t.recordDate ASC")
    List<TeamTrendDataModel> findWeeklyDataByTeam(
            @Param("team") TeamModel team,
            @Param("fromDate") OffsetDateTime fromDate,
            @Param("toDate") OffsetDateTime toDate);

    /**
     * Get teams with the highest improvement over a period
     *
     * @param category The category to check
     * @param fromDate Start date
     * @param toDate   End date
     * @return List of team IDs and their improvement values
     */
    @Query("SELECT t.team.id as teamId, " +
            "(MAX(CASE WHEN t.recordDate = :toDate THEN t.averageRating ELSE 0 END) - " +
            "MAX(CASE WHEN t.recordDate = :fromDate THEN t.averageRating ELSE 0 END)) as improvement " +
            "FROM TeamTrendDataModel t " +
            "WHERE t.category = :category " +
            "AND t.recordDate IN (:fromDate, :toDate) " +
            "GROUP BY t.team.id " +
            "ORDER BY improvement DESC")
    List<Object[]> findTeamsWithHighestImprovement(
            @Param("category") CampsCategory category,
            @Param("fromDate") OffsetDateTime fromDate,
            @Param("toDate") OffsetDateTime toDate);
}