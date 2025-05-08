package com.acoustic.camps.repository;

import com.acoustic.camps.codegen.types.CampsCategory;
import com.acoustic.camps.model.TeamModel;
import com.acoustic.camps.model.TeamStatsModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for TeamStats entity
 */
@Repository
public interface TeamStatsRepository extends JpaRepository<TeamStatsModel, UUID> {

    /**
     * Find the most recent team statistics record for a given team, category and exact date
     *
     * @param team       The team
     * @param category   The CAMPS category
     * @param recordDate The exact date to find records for
     * @return The matching TeamStats record, if found
     */
    Optional<TeamStatsModel> findTopByTeamAndCategoryAndRecordDateOrderByRecordDateDesc(
            TeamModel team, CampsCategory category, LocalDate recordDate);

    /**
     * Find the most recent team statistics record for a given team and category
     * before or equal to a specified date
     *
     * @param team     The team
     * @param category The CAMPS category
     * @param maxDate  The maximum date (inclusive)
     * @return The most recent TeamStats record, if found
     */
    Optional<TeamStatsModel> findTopByTeamAndCategoryAndRecordDateLessThanEqualOrderByRecordDateDesc(
            TeamModel team, CampsCategory category, LocalDate maxDate);

    /**
     * Find all team statistics records for a given team within a date range
     *
     * @param team     The team
     * @param fromDate The start date (inclusive)
     * @param toDate   The end date (inclusive)
     * @return List of TeamStats records ordered by date ascending
     */
    List<TeamStatsModel> findByTeamAndRecordDateBetweenOrderByRecordDateAsc(
            TeamModel team, LocalDate fromDate, LocalDate toDate);

    /**
     * Find all team statistics records for a specific team, category, and date range
     *
     * @param team     The team
     * @param category The CAMPS category
     * @param fromDate The start date (inclusive)
     * @param toDate   The end date (inclusive)
     * @return List of TeamStats records ordered by date ascending
     */
    List<TeamStatsModel> findByTeamAndCategoryAndRecordDateBetweenOrderByRecordDateAsc(
            TeamModel team, CampsCategory category, LocalDate fromDate, LocalDate toDate);

    /**
     * Find all category data for a specific team and date
     *
     * @param team       The team
     * @param recordDate The exact date to find records for
     * @return List of TeamStats with all categories for the specified team and date
     */
    @Query("SELECT ts FROM TeamStatsModel ts " +
            "WHERE ts.team = :team AND ts.recordDate = :recordDate")
    List<TeamStatsModel> findAllCategoriesByTeamAndDate(
            @Param("team") TeamModel team,
            @Param("recordDate") LocalDate recordDate);

    /**
     * Find top performing categories across all teams for a specific date
     *
     * @param recordDate The date to find records for
     * @return List of Object arrays with category and average rating, ordered by rating descending
     */
    @Query("SELECT ts.category, AVG(ts.averageRating) as avgRating " +
            "FROM TeamStatsModel ts " +
            "WHERE ts.recordDate = :recordDate " +
            "GROUP BY ts.category " +
            "ORDER BY avgRating DESC")
    List<Object[]> findTopCategoriesAcrossAllTeams(@Param("recordDate") LocalDate recordDate);

    /**
     * Find teams with the highest average in a specific category
     *
     * @param category The CAMPS category to analyze
     * @param date     The date to find records for
     * @return List of Object arrays with team entity and average rating, ordered by rating descending
     */
    @Query("SELECT ts.team, ts.averageRating " +
            "FROM TeamStatsModel ts " +
            "WHERE ts.category = :category AND ts.recordDate = :date " +
            "ORDER BY ts.averageRating DESC")
    List<Object[]> findTeamsWithHighestAverageByCategory(
            @Param("category") CampsCategory category,
            @Param("date") LocalDate date);

    Optional<Object> findTopByTeamAndCategoryAndRecordDateLessThanOrderByRecordDateDesc(
            TeamModel team, CampsCategory category, LocalDate date);
}