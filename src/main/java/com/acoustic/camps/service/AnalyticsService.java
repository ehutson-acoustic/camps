package com.acoustic.camps.service;

import com.acoustic.camps.codegen.types.CampsCategory;
import com.acoustic.camps.codegen.types.CategoryAverage;
import com.acoustic.camps.codegen.types.Team;
import com.acoustic.camps.codegen.types.TeamStats;
import com.acoustic.camps.codegen.types.TrendData;
import com.acoustic.camps.mapper.EmployeeTrendDataMapper;
import com.acoustic.camps.mapper.TeamTrendDataMapper;
import com.acoustic.camps.model.EmployeeModel;
import com.acoustic.camps.model.EmployeeTrendDataModel;
import com.acoustic.camps.model.EngagementRatingModel;
import com.acoustic.camps.model.TeamModel;
import com.acoustic.camps.model.TeamStatsModel;
import com.acoustic.camps.model.TeamTrendDataModel;
import com.acoustic.camps.repository.EmployeeRepository;
import com.acoustic.camps.repository.EmployeeTrendDataRepository;
import com.acoustic.camps.repository.EngagementRatingRepository;
import com.acoustic.camps.repository.TeamRepository;
import com.acoustic.camps.repository.TeamStatsRepository;
import com.acoustic.camps.repository.TeamTrendDataRepository;
import com.acoustic.camps.util.time.ComparisonPeriod;
import com.acoustic.camps.util.time.DateInterval;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static com.acoustic.camps.util.time.ComparisonPeriod.calculatePreviousPeriod;

/**
 * Service for analyzing trends and generating reports
 */
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final EngagementRatingRepository ratingRepository;
    private final EmployeeRepository employeeRepository;
    private final TeamStatsRepository teamStatsRepository;
    private final TeamTrendDataRepository teamTrendDataRepository;
    private final EmployeeTrendDataRepository employeeTrendDataRepository;
    private final TeamRepository teamRepository;
    private final TeamTrendDataMapper teamTrendDataMapper;
    private final EmployeeTrendDataMapper employeeTrendDataMapper;

    @Transactional(readOnly = true)
    public List<CategoryAverage> getTeamAveragesWithComparison(UUID teamId, OffsetDateTime date) {
        OffsetDateTime targetDate = (date != null) ? date : OffsetDateTime.now();
        OffsetDateTime previousDate = calculatePreviousPeriod(targetDate, ComparisonPeriod.WEEK);

        // Get all category averages
        List<Object[]> categoryAverages = ratingRepository.calculateAllCategoryAveragesWithPrevious(teamId, targetDate, previousDate);

        // Process results
        Map<CampsCategory, CategoryAverage> averagesByCategory = new EnumMap<>(CampsCategory.class);

        // Initialize all categories
        for (CampsCategory category : CampsCategory.values()) {
            CategoryAverage avg = new CategoryAverage();
            avg.setCategory(category);
            avg.setAverageRating(0.0);
            averagesByCategory.put(category, avg);
        }

        // Update with the actual values
        for (Object[] row : categoryAverages) {
            CampsCategory category = CampsCategory.valueOf((String) row[0]);
            double currentAvg = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
            Double previousAvg = row[2] != null ? ((Number) row[2]).doubleValue() : null;

            CategoryAverage avg = averagesByCategory.get(category);
            avg.setAverageRating(currentAvg);
            avg.setPreviousAverageRating(previousAvg);
            avg.setChange(previousAvg != null ? currentAvg - previousAvg : null);
        }

        return new ArrayList<>(averagesByCategory.values());
    }

    /**
     * Get team averages for a specific date
     *
     * @param teamId Team ID
     * @param date   Date for which to calculate averages
     * @return Map of CampsCategory to average rating
     */
    @Transactional(readOnly = true)
    public Map<CampsCategory, Double> getTeamAverages(UUID teamId, OffsetDateTime date) {
        Map<CampsCategory, Double> averages = new EnumMap<>(CampsCategory.class);

        List<Object[]> results = ratingRepository.calculateTeamAveragesByCategory(teamId, date);

        // Initialize all categories to 0.0
        for (CampsCategory category : CampsCategory.values()) {
            averages.put(category, 0.0);
        }

        // Populate averages from the results
        for (Object[] result : results) {
            CampsCategory category = (CampsCategory) result[0];
            Double average = (Double) result[1];

            if (average != null) {
                averages.put(category, average);
            }
        }

        return averages;
    }

    /**
     * Get team statistics for a specific date range
     *
     * @param teamId   Team ID
     * @param fromDate Start date (inclusive)
     * @param toDate   End date (inclusive)
     * @return List of TeamStats objects
     */
    @Transactional(readOnly = true)
    public List<TeamStats> getTeamStatsByDateRange(UUID teamId, OffsetDateTime fromDate, OffsetDateTime toDate) {
        List<TeamStats> result = new ArrayList<>();
        TeamModel team = getTeamModel(teamId);

        // Determine the appropriate interval based on the date range
        DateInterval interval = DateInterval.determineInterval(fromDate, toDate);

        // Get aggregated stats from the database
        List<Object[]> statsData = ratingRepository.calculateTeamStatsByInterval(teamId, fromDate, toDate, interval.name());

        // Map the results to TeamStats objects
        for (Object[] row : statsData) {
            OffsetDateTime date = ((Timestamp) row[0]).toLocalDateTime().atOffset(ZoneOffset.UTC);
            CampsCategory category = CampsCategory.valueOf((String) row[1]);
            double averageRating = ((Number) row[2]).doubleValue();
            Integer employeeCount = ((Number) row[3]).intValue();


            TeamStats stats = new TeamStats();
            stats.setTeam(new Team());
            stats.getTeam().setId(team.getId().toString());
            stats.getTeam().setName(team.getName());
            stats.setRecordDate(date);
            stats.setCategory(category);
            stats.setAverageRating(averageRating);
            stats.setEmployeeCount(employeeCount);

            result.add(stats);
        }

        return result;
    }

    /**
     * Get the date of the most recent trend calculation for a team
     *
     * @param teamId Team ID
     * @return The most recent calculation date or null if none exists
     */
    @Transactional(readOnly = true)
    public OffsetDateTime getLastTrendCalculationDate(UUID teamId) {
        TeamModel team = getTeamModel(teamId);

        // Check in the team trend data repository
        Optional<TeamTrendDataModel> latestTrendData = teamTrendDataRepository.findAll().stream()
                .filter(trend -> trend.getTeam().getId().equals(teamId))
                .max((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()));

        return latestTrendData.map(TeamTrendDataModel::getCreatedAt).orElse(null);
    }

    @Transactional(readOnly = true)
    public List<TrendData> getTrends(UUID employeeId, UUID teamId, CampsCategory category, OffsetDateTime fromDate, OffsetDateTime toDate) {
        List<TrendData> result = new ArrayList<>();

        // Generate or retrieve trend data
        if (employeeId != null) {
            EmployeeModel employee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

            List<EmployeeTrendDataModel> employeeTrends = employeeTrendDataRepository
                    .findByEmployeeAndCategoryAndRecordDateBetweenOrderByRecordDateAsc(
                            employee, category, fromDate, toDate);

            // Map to TrendData DTOs
            return employeeTrendDataMapper.toTrendDataList(employeeTrends);
        } else if (teamId != null) {
            TeamModel team = getTeamModel(teamId);

            List<TeamTrendDataModel> teamTrends = teamTrendDataRepository
                    .findByTeamAndCategoryAndRecordDateBetweenOrderByRecordDateAsc(
                            team, category, fromDate, toDate);

            // Map to TrendData DTOs
            return teamTrendDataMapper.toTrendDataList(teamTrends);
        }

        return result;
    }

    /**
     * Helper method to generate trend data for a team
     */
    public void generateTeamTrendData(TeamModel team, CampsCategory category,
                                      OffsetDateTime currentMonth, OffsetDateTime previousMonth,
                                      OffsetDateTime previousQuarter, OffsetDateTime previousYear) {
        // Get current month average
        Double currentAvg = teamStatsRepository
                .findTopByTeamAndCategoryAndRecordDateLessThanEqualOrderByRecordDateDesc(
                        team, category, currentMonth.plusMonths(1).minusDays(1))
                .map(TeamStatsModel::getAverageRating)
                .orElse(null);

        if (currentAvg == null) {
            return; // No data for this month
        }

        // Get previous period averages
        Double prevMonthAvg = teamStatsRepository
                .findTopByTeamAndCategoryAndRecordDateLessThanEqualOrderByRecordDateDesc(
                        team, category, previousMonth.plusMonths(1).minusDays(1))
                .map(TeamStatsModel::getAverageRating)
                .orElse(null);

        Double prevQuarterAvg = teamStatsRepository
                .findTopByTeamAndCategoryAndRecordDateLessThanEqualOrderByRecordDateDesc(
                        team, category, previousQuarter.plusMonths(1).minusDays(1))
                .map(TeamStatsModel::getAverageRating)
                .orElse(null);

        Double prevYearAvg = teamStatsRepository
                .findTopByTeamAndCategoryAndRecordDateLessThanEqualOrderByRecordDateDesc(
                        team, category, previousYear.plusMonths(1).minusDays(1))
                .map(TeamStatsModel::getAverageRating)
                .orElse(null);

        // Create and save trend data entity
        TeamTrendDataModel trendDataModel = TeamTrendDataModel.builder()
                .team(team)
                .recordDate(currentMonth)
                .category(category)
                .averageRating(currentAvg)
                .previousAverageRating(prevMonthAvg)
                .monthOverMonthChange(calculateChange(currentAvg, prevMonthAvg))
                .quarterOverQuarterChange(calculateChange(currentAvg, prevQuarterAvg))
                .yearOverYearChange(calculateChange(currentAvg, prevYearAvg))
                .build();

        teamTrendDataRepository.save(trendDataModel);
    }

    /**
     * Helper method to calculate change between two values
     */
    private Double calculateChange(Double current, Double previous) {
        if (current == null || previous == null) {
            return null;
        }
        return current - previous;
    }

    /**
     * Gets the most improved category for each employee within a date range
     *
     * @param fromDate Start date for analysis
     * @param toDate   End date for analysis
     * @return Map of employee IDs to Maps containing improvement details
     */
    @Transactional(readOnly = true)
    public Map<UUID, Map<String, Object>> getMostImprovedCategories(OffsetDateTime fromDate, OffsetDateTime toDate) {
        Map<UUID, Map<String, Object>> results = new HashMap<>();
        List<EmployeeModel> employeeModels = employeeRepository.findAll();

        for (EmployeeModel employeeModel : employeeModels) {
            Map<CampsCategory, Integer> improvements = new EnumMap<>(CampsCategory.class);

            // Calculate improvement for each category
            for (CampsCategory category : CampsCategory.values()) {
                // Get rating at the start of range
                Optional<EngagementRatingModel> startRatingOpt = ratingRepository
                        .findTopByEmployeeIdAndCategoryAndRatingDateLessThanEqualOrderByRatingDateDesc(
                                employeeModel.getId(), category, fromDate);

                // Get rating at the end of range
                Optional<EngagementRatingModel> endRatingOpt = ratingRepository
                        .findTopByEmployeeIdAndCategoryAndRatingDateLessThanEqualOrderByRatingDateDesc(
                                employeeModel.getId(), category, toDate);

                // Calculate improvement if both ratings exist
                if (startRatingOpt.isPresent() && endRatingOpt.isPresent()) {
                    EngagementRatingModel startRating = startRatingOpt.get();
                    EngagementRatingModel endRating = endRatingOpt.get();

                    // Only consider ratings within the range
                    if (!startRating.getRatingDate().equals(endRating.getRatingDate())) {
                        int improvement = endRating.getRating() - startRating.getRating();
                        improvements.put(category, improvement);
                    }
                }
            }

            // Find the most improved category
            if (!improvements.isEmpty()) {
                Map.Entry<CampsCategory, Integer> mostImproved = improvements.entrySet().stream()
                        .max(Map.Entry.comparingByValue())
                        .orElse(null);

                if (mostImproved != null && mostImproved.getValue() > 0) {
                    Map<String, Object> improvementDetails = new HashMap<>();
                    improvementDetails.put("employeeName", employeeModel.getName());
                    improvementDetails.put("team", employeeModel.getTeam());
                    improvementDetails.put("category", mostImproved.getKey());
                    improvementDetails.put("improvement", mostImproved.getValue());
                    improvementDetails.put("fromDate", fromDate);
                    improvementDetails.put("toDate", toDate);

                    results.put(employeeModel.getId(), improvementDetails);
                }
            }
        }

        return results;
    }

    private TeamModel getTeamModel(UUID teamId) {
        return teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found"));
    }
}