package com.acoustic.camps.service;

import com.acoustic.camps.codegen.types.CampsCategory;
import com.acoustic.camps.model.AnalyticsProcessingLogModel;
import com.acoustic.camps.model.EmployeeModel;
import com.acoustic.camps.model.EmployeeTrendDataModel;
import com.acoustic.camps.model.EngagementRatingModel;
import com.acoustic.camps.model.TeamModel;
import com.acoustic.camps.model.TeamTrendDataModel;
import com.acoustic.camps.model.enums.ProcessingStatus;
import com.acoustic.camps.model.enums.SnapshotType;
import com.acoustic.camps.repository.AnalyticsProcessingLogRepository;
import com.acoustic.camps.repository.EmployeeRepository;
import com.acoustic.camps.repository.EmployeeTrendDataRepository;
import com.acoustic.camps.repository.EngagementRatingRepository;
import com.acoustic.camps.repository.TeamRepository;
import com.acoustic.camps.repository.TeamTrendDataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.OffsetDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * Service for calculating weekly trend data
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WeeklyTrendCalculationService {

    private final EmployeeRepository employeeRepository;
    private final TeamRepository teamRepository;
    private final EngagementRatingRepository ratingRepository;
    private final TeamTrendDataRepository teamTrendDataRepository;
    private final EmployeeTrendDataRepository employeeTrendDataRepository;
    private final AnalyticsProcessingLogRepository processingLogRepository;

    /**
     * Weekly scheduled task to calculate trend data for all teams and employees
     * Runs at 1 AM every Monday
     */
    @Scheduled(cron = "0 0 1 * * MON")
    public void calculateWeeklyTrends() {
        log.info("Starting scheduled weekly trend calculation");
        OffsetDateTime endDate = OffsetDateTime.now()
                .with(TemporalAdjusters.previousOrSame(DayOfWeek.SUNDAY))
                .withHour(23).withMinute(59).withSecond(59);

        // Get the beginning of the week (previous Monday)
        OffsetDateTime startDate = endDate.minusDays(6)
                .withHour(0).withMinute(0).withSecond(0);

        calculateWeeklyTrendsForPeriod(startDate, endDate);
    }

    /**
     * Method called at application startup to check and calculate trends if needed
     */
    public void checkAndCalculateOnStartup() {
        log.info("Checking trend data on application startup");
        checkWeeklyTrendCalculation();
    }

    private void checkWeeklyTrendCalculation() {
        log.info("Checking if weekly trend calculation is needed");

        // Get the end of the previous week
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime previousSunday = now.with(java.time.DayOfWeek.SUNDAY);
        if (previousSunday.isAfter(now)) {
            previousSunday = previousSunday.minusWeeks(1);
        }
        previousSunday = previousSunday.withHour(23).withMinute(59).withSecond(59);

        // Get the start of the week (last Monday)
        OffsetDateTime previousMonday = previousSunday.minusDays(6)
                .withHour(0).withMinute(0).withSecond(0);

        calculateWeeklyTrendsForPeriod(previousMonday, previousSunday);

    }

    @Async
    public CompletableFuture<Boolean> calculateWeeklyTrendsAsync() {
        log.info("Starting async weekly trend calculation");

        try {
            // Get the end of the previous week (last Sunday)
            OffsetDateTime now = OffsetDateTime.now();
            OffsetDateTime previousSunday = now.with(java.time.DayOfWeek.SUNDAY);
            if (previousSunday.isAfter(now)) {
                previousSunday = previousSunday.minusWeeks(1);
            }
            previousSunday = previousSunday.withHour(23).withMinute(59).withSecond(59);

            // Get the start of the week (last Monday)
            OffsetDateTime previousMonday = previousSunday.minusDays(6)
                    .withHour(0).withMinute(0).withSecond(0);

            boolean success = calculateWeeklyTrendsForPeriod(
                    previousMonday, previousSunday);

            return CompletableFuture.completedFuture(success);
        } catch (Exception e) {
            log.error("Error during async weekly trend calculation: {}", e.getMessage(), e);
            return CompletableFuture.completedFuture(false);
        }
    }

    /**
     * Calculate weekly trends for a specific period
     *
     * @param startDate Start of the week
     * @param endDate   End of the week
     * @return true if successful, false otherwise
     */
    @Transactional
    public boolean calculateWeeklyTrendsForPeriod(OffsetDateTime startDate, OffsetDateTime endDate) {
        String weekIdentifier = startDate.toLocalDate() + " to " + endDate.toLocalDate();
        log.info("Calculating weekly trends for period: {}", weekIdentifier);

        // Check if we've already processed this week
        Optional<AnalyticsProcessingLogModel> existingLog = processingLogRepository
                .findTopBySnapshotTypeAndStatusOrderByProcessingDateDesc(SnapshotType.WEEKLY, ProcessingStatus.COMPLETED);

        if (existingLog.isPresent() && !existingLog.get().getEndDate().isBefore(endDate)) {
            log.info("Weekly trends already calculated for period ending on: {}", endDate);
            return true;
        }

        // Create processing log entry
        AnalyticsProcessingLogModel processingLog = AnalyticsProcessingLogModel.builder()
                .id(UUID.randomUUID())
                .snapshotType(SnapshotType.WEEKLY)
                .processingDate(OffsetDateTime.now())
                .startDate(startDate)
                .endDate(endDate)
                .status(ProcessingStatus.PENDING)
                .build();

        processingLogRepository.save(processingLog);

        try {
            // Calculate team-level trends
            List<TeamModel> teams = teamRepository.findAll();
            for (TeamModel team : teams) {
                calculateTeamWeeklyTrends(team, startDate, endDate);
            }

            // Calculate employee-level trends
            List<EmployeeModel> employees = employeeRepository.findAll();
            for (EmployeeModel employee : employees) {
                calculateEmployeeWeeklyTrends(employee, startDate, endDate);
            }

            // Update processing log
            processingLog.setStatus(ProcessingStatus.COMPLETED);
            processingLog.setCompletedAt(OffsetDateTime.now());
            processingLogRepository.save(processingLog);

            log.info("Weekly trend calculation completed successfully for period: {}", weekIdentifier);
            return true;
        } catch (Exception e) {
            log.error("Error calculating weekly trends for period {}: {}", weekIdentifier, e.getMessage(), e);

            // Update processing log
            processingLog.setStatus(ProcessingStatus.FAILED);
            processingLog.setErrorMessage(e.getMessage());
            processingLogRepository.save(processingLog);

            return false;
        }
    }

    /**
     * Calculate weekly trends for a specific team
     */
    private void calculateTeamWeeklyTrends(TeamModel team, OffsetDateTime startDate, OffsetDateTime endDate) {
        log.debug("Calculating weekly trends for team: {}", team.getName());

        // Calculate for each CAMPS category
        for (CampsCategory category : CampsCategory.values()) {
            // Get ratings for all employees in this team for this week
            List<EngagementRatingModel> weeklyRatings = getTeamWeeklyRatings(team, category, startDate, endDate);

            if (weeklyRatings.isEmpty()) {
                log.debug("No ratings found for team {} in category {} for week ending {}",
                        team.getName(), category, endDate);
                continue;
            }

            // Calculate average rating
            double averageRating = weeklyRatings.stream()
                    .mapToInt(EngagementRatingModel::getRating)
                    .average()
                    .orElse(0);

            // Get previous period data for comparison
            OffsetDateTime previousWeekEnd = startDate.minusDays(1);
            OffsetDateTime previousWeekStart = previousWeekEnd.minusDays(6);

            Optional<TeamTrendDataModel> previousWeekData = teamTrendDataRepository
                    .findByTeamAndCategoryAndRecordDateBetweenOrderByRecordDateAsc(
                            team, category, previousWeekStart, previousWeekEnd)
                    .stream()
                    .findFirst();

            // Get previous month data
            OffsetDateTime previousMonthDate = endDate.minusMonths(1);
            Optional<TeamTrendDataModel> previousMonthData = teamTrendDataRepository
                    .findTopByTeamAndCategoryOrderByRecordDateDesc(team, category);

            // Get previous quarter data
            OffsetDateTime previousQuarterDate = endDate.minusMonths(3);
            Optional<TeamTrendDataModel> previousQuarterData = teamTrendDataRepository
                    .findByTeamAndCategoryAndRecordDateBetweenOrderByRecordDateAsc(
                            team, category, previousQuarterDate.minusDays(7), previousQuarterDate)
                    .stream()
                    .findFirst();

            // Calculate changes
            Double previousWeekAvg = previousWeekData.map(TeamTrendDataModel::getAverageRating).orElse(null);
            Double weekOverWeekChange = previousWeekAvg != null ? averageRating - previousWeekAvg : null;

            Double previousMonthAvg = previousMonthData.map(TeamTrendDataModel::getAverageRating).orElse(null);
            Double monthOverMonthChange = previousMonthAvg != null ? averageRating - previousMonthAvg : null;

            Double previousQuarterAvg = previousQuarterData.map(TeamTrendDataModel::getAverageRating).orElse(null);
            Double quarterOverQuarterChange = previousQuarterAvg != null ? averageRating - previousQuarterAvg : null;

            // Save trend data
            TeamTrendDataModel trendData = TeamTrendDataModel.builder()
                    .id(UUID.randomUUID())
                    .team(team)
                    .recordDate(endDate)
                    .category(category)
                    .averageRating(averageRating)
                    .previousAverageRating(previousWeekAvg)
                    .weekOverWeekChange(weekOverWeekChange)
                    .monthOverMonthChange(monthOverMonthChange)
                    .quarterOverQuarterChange(quarterOverQuarterChange)
                    .employeeCount(weeklyRatings.stream()
                            .map(rating -> rating.getEmployee().getId())
                            .collect(Collectors.toSet())
                            .size())
                    .dataPoints(weeklyRatings.size())
                    .build();

            teamTrendDataRepository.save(trendData);

            log.debug("Saved weekly trend data for team {} in category {}: avg={}",
                    team.getName(), category, averageRating);
        }
    }

    /**
     * Calculate weekly trends for a specific employee
     */
    private void calculateEmployeeWeeklyTrends(EmployeeModel employee, OffsetDateTime startDate, OffsetDateTime endDate) {
        log.debug("Calculating weekly trends for employee: {}", employee.getName());

        // Calculate for each CAMPS category
        for (CampsCategory category : CampsCategory.values()) {
            // Get the most recent rating for this employee in this category within this week
            Optional<EngagementRatingModel> latestRating = ratingRepository
                    .findByEmployeeIdAndCategoryAndRatingDateBetweenOrderByRatingDateDesc(
                            employee.getId(), category, startDate, endDate)
                    .stream()
                    .findFirst();

            if (latestRating.isEmpty()) {
                log.debug("No ratings found for employee {} in category {} for week ending {}",
                        employee.getName(), category, endDate);
                continue;
            }

            double rating = latestRating.get().getRating();

            // Get previous period data for comparison
            OffsetDateTime previousWeekEnd = startDate.minusDays(1);
            OffsetDateTime previousWeekStart = previousWeekEnd.minusDays(6);

            Optional<EmployeeTrendDataModel> previousWeekData = employeeTrendDataRepository
                    .findByEmployeeAndCategoryAndRecordDateBetweenOrderByRecordDateAsc(
                            employee, category, previousWeekStart, previousWeekEnd)
                    .stream()
                    .findFirst();

            // Get previous month data
            OffsetDateTime previousMonthDate = endDate.minusMonths(1);
            Optional<EmployeeTrendDataModel> previousMonthData = employeeTrendDataRepository
                    .findTopByEmployeeAndCategoryOrderByRecordDateDesc(employee, category);

            // Get previous quarter data
            OffsetDateTime previousQuarterDate = endDate.minusMonths(3);
            Optional<EmployeeTrendDataModel> previousQuarterData = employeeTrendDataRepository
                    .findByEmployeeAndCategoryAndRecordDateBetweenOrderByRecordDateAsc(
                            employee, category, previousQuarterDate.minusDays(7), previousQuarterDate)
                    .stream()
                    .findFirst();

            // Calculate changes
            Double previousWeekRating = previousWeekData.map(EmployeeTrendDataModel::getRating).orElse(null);
            Double weekOverWeekChange = previousWeekRating != null ? rating - previousWeekRating : null;

            Double previousMonthRating = previousMonthData.map(EmployeeTrendDataModel::getRating).orElse(null);
            Double monthOverMonthChange = previousMonthRating != null ? rating - previousMonthRating : null;

            Double previousQuarterRating = previousQuarterData.map(EmployeeTrendDataModel::getRating).orElse(null);
            Double quarterOverQuarterChange = previousQuarterRating != null ? rating - previousQuarterRating : null;

            // Save trend data
            EmployeeTrendDataModel trendData = EmployeeTrendDataModel.builder()
                    .id(UUID.randomUUID())
                    .employee(employee)
                    .team(employee.getTeam())
                    .recordDate(endDate)
                    .category(category)
                    .rating(rating)
                    .previousRating(previousWeekRating)
                    .weekOverWeekChange(weekOverWeekChange)
                    .monthOverMonthChange(monthOverMonthChange)
                    .quarterOverQuarterChange(quarterOverQuarterChange)
                    .build();

            employeeTrendDataRepository.save(trendData);

            log.debug("Saved weekly trend data for employee {} in category {}: rating={}",
                    employee.getName(), category, rating);
        }
    }

    /**
     * Get all ratings for employees in a team for a specific category and time period
     */
    private List<EngagementRatingModel> getTeamWeeklyRatings(
            TeamModel team, CampsCategory category, OffsetDateTime startDate, OffsetDateTime endDate) {

        List<EmployeeModel> teamEmployees = employeeRepository.findByTeam(team);
        Map<UUID, EngagementRatingModel> latestRatings = new HashMap<>();

        for (EmployeeModel employee : teamEmployees) {
            ratingRepository
                    .findByEmployeeIdAndCategoryAndRatingDateBetweenOrderByRatingDateDesc(
                            employee.getId(), category, startDate, endDate)
                    .stream()
                    .findFirst()
                    .ifPresent(rating -> latestRatings.put(employee.getId(), rating));
        }

        return latestRatings.values().stream().toList();
    }
}