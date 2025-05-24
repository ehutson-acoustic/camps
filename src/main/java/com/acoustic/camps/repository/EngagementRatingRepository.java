package com.acoustic.camps.repository;

import com.acoustic.camps.codegen.types.CampsCategory;
import com.acoustic.camps.model.EngagementRatingModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for EngagementRating entity
 */
@Repository
public interface EngagementRatingRepository extends JpaRepository<EngagementRatingModel, UUID> {

    /**
     * Find all ratings for a specific employee, ordered by rating date in descending order
     *
     * @param employeeId The employee's ID
     * @return List of EngagementRatingModel objects
     */
    List<EngagementRatingModel> findByEmployeeIdOrderByRatingDateDesc(UUID employeeId);

    /**
     * Find all ratings for a specific employee and category, ordered by rating date in descending order
     *
     * @param employeeId The employee's ID
     * @param category   The category to filter by
     * @return List of EngagementRatingModel objects
     */
    List<EngagementRatingModel> findByEmployeeIdAndCategoryOrderByRatingDateDesc(
            UUID employeeId, CampsCategory category);

    /**
     * Find all ratings for a specific employee, category, and date range, ordered by rating date in descending order
     *
     * @param employeeId The employee's ID
     * @param category   The category to filter by
     * @param fromDate   Start date (inclusive)
     * @param toDate     End date (inclusive)
     * @return List of EngagementRatingModel objects
     */
    List<EngagementRatingModel> findByEmployeeIdAndCategoryAndRatingDateBetweenOrderByRatingDateDesc(
            UUID employeeId, CampsCategory category, OffsetDateTime fromDate, OffsetDateTime toDate);

    /**
     * Find the most recent rating for a specific employee and category
     *
     * @param employeeId The employee's ID
     * @param category   The category to filter by
     * @return Optional EngagementRatingModel object
     */
    Optional<EngagementRatingModel> findTopByEmployeeIdAndCategoryOrderByRatingDateDesc(
            UUID employeeId, CampsCategory category);

    /**
     * Find the most recent rating for a specific employee and category before or on a given date
     *
     * @param employeeId The employee's ID
     * @param category   The category to filter by
     * @param maxDate    The maximum date for the rating
     * @return Optional EngagementRatingModel object
     */
    Optional<EngagementRatingModel> findTopByEmployeeIdAndCategoryAndRatingDateLessThanEqualOrderByRatingDateDesc(
            UUID employeeId, CampsCategory category, OffsetDateTime maxDate);

    /**
     * Find the most recent rating for a specific employee and category before a given date
     *
     * @param employeeId The employee's ID
     * @param category   The category to filter by
     * @param ratingDate The date to compare against
     * @return Optional EngagementRatingModel object
     */
    Optional<EngagementRatingModel> findTopByEmployeeIdAndCategoryAndRatingDateLessThanOrderByRatingDateDesc(
            UUID employeeId, CampsCategory category, OffsetDateTime ratingDate);

    /**
     * Find all ratings within a specific date range, ordered by rating date in descending order
     *
     * @param fromDate Start date (inclusive)
     * @param toDate   End date (inclusive)
     * @return List of EngagementRatingModel objects
     */
    List<EngagementRatingModel> findByRatingDateBetweenOrderByRatingDateDesc(
            OffsetDateTime fromDate, OffsetDateTime toDate);

    /**
     * Calculate the average ratings for a team, grouped by category
     *
     * @param teamId   The team's ID
     * @param asOfDate The reference date
     * @return List of category and average rating pairs
     */
    @Query("SELECT er.category as category, AVG(er.rating) as averageRating,COUNT(DISTINCT er.employee.id) as employeeCount " +
            "FROM EngagementRatingModel er " +
            "WHERE er.employee.team.id = :teamId " +
            "AND er.ratingDate <= :asOfDate " +
            "AND er.ratingDate = (" +
            "    SELECT MAX(er2.ratingDate) " +
            "    FROM EngagementRatingModel er2 " +
            "    WHERE er2.employee = er.employee " +
            "    AND er2.category = er.category " +
            "    AND er2.ratingDate <= :asOfDate" +
            ") " +
            "GROUP BY er.category")
    List<Object[]> calculateTeamAveragesByCategory(
            @Param("teamId") UUID teamId,
            @Param("asOfDate") OffsetDateTime asOfDate);


    /**
     * Calculate the average ratings for a team, grouped by category, with previous averages
     *
     * @param teamId       The team's ID
     * @param currentDate  The reference date for current ratings
     * @param previousDate The reference date for previous ratings
     * @return List of category, current average, and previous average pairs
     */
    @Query(nativeQuery = true, value =
            "WITH current_ratings AS (" +
                    "  SELECT e.employee_id, e.category, e.rating " +
                    "  FROM (" +
                    "    SELECT er.employee_id, er.category, er.rating, " +
                    "           ROW_NUMBER() OVER (PARTITION BY er.employee_id, er.category " +
                    "                             ORDER BY er.rating_date DESC) as rn " +
                    "    FROM engagement_ratings er " +
                    "    JOIN employees emp ON er.employee_id = emp.id " +
                    "    WHERE emp.team_id = :teamId " +
                    "    AND er.rating_date <= :currentDate " +
                    "  ) e " +
                    "  WHERE e.rn = 1 " +
                    "), " +
                    "previous_ratings AS (" +
                    "  SELECT e.employee_id, e.category, e.rating " +
                    "  FROM (" +
                    "    SELECT er.employee_id, er.category, er.rating, " +
                    "           ROW_NUMBER() OVER (PARTITION BY er.employee_id, er.category " +
                    "                             ORDER BY er.rating_date DESC) as rn " +
                    "    FROM engagement_ratings er " +
                    "    JOIN employees emp ON er.employee_id = emp.id " +
                    "    WHERE emp.team_id = :teamId " +
                    "    AND er.rating_date <= :previousDate " +
                    "  ) e " +
                    "  WHERE e.rn = 1 " +
                    ") " +
                    "SELECT cr.category, " +
                    "       AVG(cr.rating) as current_avg, " +
                    "       AVG(pr.rating) as previous_avg " +
                    "FROM current_ratings cr " +
                    "LEFT JOIN previous_ratings pr ON cr.employee_id = pr.employee_id AND cr.category = pr.category " +
                    "GROUP BY cr.category")
    List<Object[]> calculateAllCategoryAveragesWithPrevious(
            @Param("teamId") UUID teamId,
            @Param("currentDate") OffsetDateTime currentDate,
            @Param("previousDate") OffsetDateTime previousDate);


    /**
     * Calculate the average rating for a specific category within a team
     *
     * @param teamId   The team's ID
     * @param category The category to filter by
     * @param asOfDate The reference date
     * @return The average rating for the specified category
     */
    @Query("SELECT AVG(er.rating) " +
            "FROM EngagementRatingModel er " +
            "WHERE er.employee.team.id = :teamId " +
            "AND er.category = :category " +
            "AND er.ratingDate <= :asOfDate " +
            "AND er.ratingDate = (" +
            "    SELECT MAX(er2.ratingDate) " +
            "    FROM EngagementRatingModel er2 " +
            "    WHERE er2.employee = er.employee " +
            "    AND er2.category = er.category " +
            "    AND er2.ratingDate <= :asOfDate" +
            ")")
    Double calculateTeamAverageForCategory(
            @Param("teamId") UUID teamId,
            @Param("category") CampsCategory category,
            @Param("asOfDate") OffsetDateTime asOfDate);

    /**
     * Count the number of employees with ratings for a specific category
     *
     * @param teamId   The team's ID
     * @param category The category to filter by
     * @param asOfDate The reference date
     * @return The number of employees with ratings for the specified category
     */
    @Query("SELECT COUNT(DISTINCT er.employee.id) " +
            "FROM EngagementRatingModel er " +
            "WHERE er.employee.team.id = :teamId " +
            "AND er.category = :category " +
            "AND er.ratingDate <= :asOfDate")
    Integer countEmployeesWithRatings(
            @Param("teamId") UUID teamId,
            @Param("category") CampsCategory category,
            @Param("asOfDate") OffsetDateTime asOfDate);

    /**
     * Calculate the ratings for a specific team and category as of a certain date
     *
     * @param teamId   The team's ID
     * @param category The category to filter by
     * @param asOfDate The reference date
     * @return List of EngagementRatingModel objects
     */
    @Query("SELECT er FROM EngagementRatingModel er " +
            "JOIN er.employee e " +
            "WHERE er.employee.team.id = :teamId " +
            "AND er.category = :category AND " +
            "er.ratingDate = (" +
            "    SELECT MAX(er2.ratingDate) " +
            "    FROM EngagementRatingModel er2 " +
            "    WHERE er2.employee = er.employee " +
            "    AND er2.category = :category " +
            "    AND er2.ratingDate <= :asOfDate" +
            ")")
    List<EngagementRatingModel> calculateCurrentTeamRatingsByCategory(
            @Param("teamId") UUID teamId,
            @Param("category") CampsCategory category,
            @Param("asOfDate") OffsetDateTime asOfDate);

    /**
     * Find ratings for a specific employee and date
     *
     * @param employeeId The employee's ID
     * @param ratingDate The date of the rating
     * @return List of EngagementRatingModel objects
     */
    @Query("SELECT er FROM EngagementRatingModel er " +
            "WHERE er.employee.id = :employeeId AND er.ratingDate = :ratingDate")
    List<EngagementRatingModel> findByEmployeeIdAndRatingDate(
            @Param("employeeId") UUID employeeId,
            @Param("ratingDate") OffsetDateTime ratingDate);

    /**
     * Calculate team stats aggregated by interval
     *
     * @param teamId   The team ID
     * @param fromDate Start date of the range
     * @param toDate   End date of the range
     * @param interval Interval type (daily, weekly, monthly)
     * @return List of objects containing date, category, average rating, and employee count
     */
    @Query(nativeQuery = true, value =
            "SELECT " +
                    "   CASE " +
                    "     WHEN :interval = 'DAILY' THEN DATE_TRUNC('day', er.rating_date) " +
                    "     WHEN :interval = 'WEEKLY' THEN DATE_TRUNC('week', er.rating_date) " +
                    "     WHEN :interval = 'MONTHLY' THEN DATE_TRUNC('month', er.rating_date) " +
                    "   END as interval_date, " +
                    "   er.category, " +
                    "   AVG(er.rating) as avg_rating, " +
                    "   COUNT(DISTINCT er.employee_id) as employee_count " +
                    "FROM " +
                    "   (SELECT e.id as employee_id, " +
                    "           cat.category, " +
                    "           (SELECT er.rating FROM engagement_ratings er " +
                    "            WHERE er.employee_id = e.id " +
                    "              AND er.category = cat.category " +
                    "              AND er.rating_date BETWEEN :fromDate AND :toDate " +
                    "            ORDER BY er.rating_date DESC " +
                    "            LIMIT 1) as rating, " +
                    "           (SELECT er.rating_date FROM engagement_ratings er " +
                    "            WHERE er.employee_id = e.id " +
                    "              AND er.category = cat.category " +
                    "              AND er.rating_date BETWEEN :fromDate AND :toDate " +
                    "            ORDER BY er.rating_date DESC " +
                    "            LIMIT 1) as rating_date " +
                    "    FROM employees e " +
                    "    CROSS JOIN (VALUES ('CERTAINTY'), ('AUTONOMY'), ('MEANING'), ('PROGRESS'), ('SOCIAL_INCLUSION')) " +
                    "              AS cat(category) " +
                    "    WHERE e.team_id = :teamId) as er " +
                    "WHERE er.rating IS NOT NULL " +
                    "GROUP BY interval_date, er.category " +
                    "ORDER BY interval_date, er.category")
    List<Object[]> calculateTeamStatsByInterval(
            @Param("teamId") UUID teamId,
            @Param("fromDate") OffsetDateTime fromDate,
            @Param("toDate") OffsetDateTime toDate,
            @Param("interval") String interval);

}
