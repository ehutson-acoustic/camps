package com.acoustic.camps.service;

import com.acoustic.camps.codegen.types.CampsCategory;
import com.acoustic.camps.codegen.types.CategoryAverage;
import com.acoustic.camps.codegen.types.Team;
import com.acoustic.camps.codegen.types.TeamStats;
import com.acoustic.camps.codegen.types.TrendData;
import com.acoustic.camps.mapper.TrendDataMapper;
import com.acoustic.camps.model.EmployeeModel;
import com.acoustic.camps.model.EngagementRatingModel;
import com.acoustic.camps.model.TeamModel;
import com.acoustic.camps.model.TeamStatsModel;
import com.acoustic.camps.model.TrendDataModel;
import com.acoustic.camps.repository.EmployeeRepository;
import com.acoustic.camps.repository.EngagementRatingRepository;
import com.acoustic.camps.repository.TeamRepository;
import com.acoustic.camps.repository.TeamStatsRepository;
import com.acoustic.camps.repository.TrendDataRepository;
import com.acoustic.camps.util.time.ComparisonPeriod;
import com.acoustic.camps.util.time.DateInterval;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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
    private final TrendDataRepository trendDataRepository;
    private final TeamRepository teamRepository;
    private final TrendDataMapper trendDataMapper;

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

    @Transactional(readOnly = true)
    public List<TrendData> getTrends(UUID employeeId, UUID teamId, CampsCategory category, OffsetDateTime fromDate, OffsetDateTime toDate) {
        // Generate or retrieve trend data
        if (employeeId != null) {
            return trendDataMapper.toTrendDataList(trendDataRepository.findByEmployeeIdAndCategoryAndRecordDateBetweenOrderByRecordDateAsc(
                    employeeId, category, fromDate, toDate));
        } else if (teamId != null) {
            TeamModel team = getTeamModel(teamId);

            return trendDataMapper.toTrendDataList(trendDataRepository.findByTeamAndCategoryAndRecordDateBetweenOrderByRecordDateAsc(
                    team, category, fromDate, toDate));
        } else {
            return Collections.emptyList();
        }
    }

    /**
     * Generates trend data for the specified month
     * This method would typically be called by a scheduled job at the end of each month
     *
     * @param monthStart The first day of the month to generate trend data for
     */
    @Transactional
    public void generateMonthlyTrendData(OffsetDateTime monthStart) {
        // Ensure we're using the first day of a month
        monthStart = monthStart.withDayOfMonth(1);

        // Define previous periods for comparison
        OffsetDateTime previousMonth = monthStart.minusMonths(1);
        OffsetDateTime previousQuarter = monthStart.minusMonths(3);
        OffsetDateTime previousYear = monthStart.minusYears(1);

        // Process each CAMPS category
        for (CampsCategory category : CampsCategory.values()) {
            // Generate team-level trends
            List<TeamModel> teams = employeeRepository.findAll().stream()
                    .map(EmployeeModel::getTeam)
                    .filter(Objects::nonNull)
                    .distinct()
                    .toList();

            for (TeamModel team : teams) {
                generateTeamTrendData(team, category, monthStart, previousMonth, previousQuarter, previousYear);
            }

            // Generate employee-level trends
            List<EmployeeModel> employeeModels = employeeRepository.findAll();
            for (EmployeeModel employeeModel : employeeModels) {
                generateEmployeeTrendData(employeeModel, category, monthStart, previousMonth, previousQuarter, previousYear);
            }

            // Generate organization-wide trends
            generateOrganizationTrendData(category, monthStart, previousMonth, previousQuarter, previousYear);
        }
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
        TrendDataModel trendDataModel = TrendDataModel.builder()
                .team(team)
                .recordDate(currentMonth)
                .category(category)
                .averageRating(currentAvg)
                .monthOverMonthChange(calculateChange(currentAvg, prevMonthAvg))
                .quarterOverQuarterChange(calculateChange(currentAvg, prevQuarterAvg))
                .yearOverYearChange(calculateChange(currentAvg, prevYearAvg))
                .build();

        trendDataRepository.save(trendDataModel);
    }

    /**
     * Helper method to generate trend data for an employee
     */
    private void generateEmployeeTrendData(EmployeeModel employeeModel, CampsCategory category,
                                           OffsetDateTime currentMonth, OffsetDateTime previousMonth,
                                           OffsetDateTime previousQuarter, OffsetDateTime previousYear) {
        // Get the current month rating
        EngagementRatingModel currentRating = ratingRepository
                .findTopByEmployeeIdAndCategoryAndRatingDateLessThanEqualOrderByRatingDateDesc(
                        employeeModel.getId(), category, currentMonth.plusMonths(1).minusDays(1))
                .orElse(null);

        if (currentRating == null) {
            return; // No data for this month
        }

        // Get previous period ratings
        EngagementRatingModel prevMonthRating = ratingRepository
                .findTopByEmployeeIdAndCategoryAndRatingDateLessThanEqualOrderByRatingDateDesc(
                        employeeModel.getId(), category, previousMonth.plusMonths(1).minusDays(1))
                .orElse(null);

        EngagementRatingModel prevQuarterRating = ratingRepository
                .findTopByEmployeeIdAndCategoryAndRatingDateLessThanEqualOrderByRatingDateDesc(
                        employeeModel.getId(), category, previousQuarter.plusMonths(1).minusDays(1))
                .orElse(null);

        EngagementRatingModel prevYearRating = ratingRepository
                .findTopByEmployeeIdAndCategoryAndRatingDateLessThanEqualOrderByRatingDateDesc(
                        employeeModel.getId(), category, previousYear.plusMonths(1).minusDays(1))
                .orElse(null);

        // Create and save trend data entity
        TrendDataModel trendDataModel = TrendDataModel.builder()
                .employee(employeeModel)
                .team(employeeModel.getTeam())
                .recordDate(currentMonth)
                .category(category)
                .averageRating((double) currentRating.getRating())
                .monthOverMonthChange(calculateChange(
                        (double) currentRating.getRating(),
                        prevMonthRating != null ? (double) prevMonthRating.getRating() : null))
                .quarterOverQuarterChange(calculateChange(
                        (double) currentRating.getRating(),
                        prevQuarterRating != null ? (double) prevQuarterRating.getRating() : null))
                .yearOverYearChange(calculateChange(
                        (double) currentRating.getRating(),
                        prevYearRating != null ? (double) prevYearRating.getRating() : null))
                .build();

        trendDataRepository.save(trendDataModel);
    }

    /**
     * Helper method to generate organization-wide trend data
     */
    private void generateOrganizationTrendData(CampsCategory category,
                                               OffsetDateTime currentMonth, OffsetDateTime previousMonth,
                                               OffsetDateTime previousQuarter, OffsetDateTime previousYear) {
        // Calculate current month average across all employees
        Double currentAvg = calculateOrganizationAverage(category, currentMonth.plusMonths(1).minusDays(1));

        if (currentAvg == null) {
            return; // No data for this month
        }

        // Calculate previous period averages
        Double prevMonthAvg = calculateOrganizationAverage(category, previousMonth.plusMonths(1).minusDays(1));
        Double prevQuarterAvg = calculateOrganizationAverage(category, previousQuarter.plusMonths(1).minusDays(1));
        Double prevYearAvg = calculateOrganizationAverage(category, previousYear.plusMonths(1).minusDays(1));

        // Create and save trend data entity
        TrendDataModel trendDataModel = TrendDataModel.builder()
                .recordDate(currentMonth)
                .category(category)
                .averageRating(currentAvg)
                .monthOverMonthChange(calculateChange(currentAvg, prevMonthAvg))
                .quarterOverQuarterChange(calculateChange(currentAvg, prevQuarterAvg))
                .yearOverYearChange(calculateChange(currentAvg, prevYearAvg))
                .build();

        trendDataRepository.save(trendDataModel);
    }

    /**
     * Helper method to calculate organization-wide average for a category
     */
    private Double calculateOrganizationAverage(CampsCategory category, OffsetDateTime asOfDate) {
        List<EmployeeModel> employeeModels = employeeRepository.findAll();
        List<Double> ratings = new ArrayList<>();

        for (EmployeeModel employeeModel : employeeModels) {
            ratingRepository
                    .findTopByEmployeeIdAndCategoryAndRatingDateLessThanEqualOrderByRatingDateDesc(
                            employeeModel.getId(), category, asOfDate)
                    .ifPresent(rating -> ratings.add((double) rating.getRating()));
        }

        if (ratings.isEmpty()) {
            return null;
        }

        return ratings.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
    }

    /**
     * Helper method to calculate change between two values
     */
    private Double calculateChange(Double current, Double previous) {
        if (current == null || previous == null) {
            return 0.0;
        }
        return current - previous;
    }

    /**
     * Identifies employees with significant rating changes
     *
     * @param threshold The minimum change to be considered significant
     * @return List of Maps containing employee details and rating changes
     */
    /*
    @Transactional(readOnly = true)
    public List<Map<String, Object>> identifySignificantChanges(int threshold) {
        List<Map<String, Object>> results = new ArrayList<>();
        List<EmployeeModel> employeeModels = employeeRepository.findAll();
        LocalDate oneMonthAgo = LocalDate.now().minusMonths(1);

        for (EmployeeModel employeeModel : employeeModels) {
            for (CampsCategory category : CampsCategory.values()) {
                // Get the most recent rating
                Optional<EngagementRatingModel> currentRatingOpt = ratingRepository
                        .findTopByEmployeeIdAndCategoryOrderByRatingDateDesc(employeeModel.getId(), category);

                if (currentRatingOpt.isPresent()) {
                    EngagementRatingModel currentRating = currentRatingOpt.get();

                    // Check if there's a significant change from previous
                    if (currentRating.getPreviousRating() != null &&
                            Math.abs(currentRating.getRating() - currentRating.getPreviousRating()) >= threshold &&
                            currentRating.getRatingDate().isAfter(oneMonthAgo)) {

                        Map<String, Object> change = new HashMap<>();
                        change.put("employeeId", employeeModel.getId());
                        change.put("employeeName", employeeModel.getName());
                        change.put("team", employeeModel.getTeam());
                        change.put("category", category);
                        change.put("oldRating", currentRating.getPreviousRating());
                        change.put("newRating", currentRating.getRating());
                        change.put("change", currentRating.getRating() - currentRating.getPreviousRating());
                        change.put("ratingDate", currentRating.getRatingDate());

                        results.add(change);
                    }
                }
            }
        }

        // Sort by absolute change magnitude (descending)
        results.sort((a, b) -> {
            int changeA = Math.abs((Integer) a.get("change"));
            int changeB = Math.abs((Integer) b.get("change"));
            return Integer.compare(changeB, changeA);
        });

        return results;
    }

     */

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