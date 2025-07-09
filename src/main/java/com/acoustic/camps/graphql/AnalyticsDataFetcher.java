package com.acoustic.camps.graphql;

import com.acoustic.camps.codegen.types.CampsCategory;
import com.acoustic.camps.codegen.types.CategoryAverage;
import com.acoustic.camps.codegen.types.DateRangeInput;
import com.acoustic.camps.codegen.types.EmployeeTrendData;
import com.acoustic.camps.codegen.types.TeamStats;
import com.acoustic.camps.codegen.types.TeamTrendData;
import com.acoustic.camps.codegen.types.TimePeriod;
import com.acoustic.camps.codegen.types.TrendAnalysisInput;
import com.acoustic.camps.codegen.types.TrendData;
import com.acoustic.camps.mapper.EmployeeTrendDataMapper;
import com.acoustic.camps.mapper.TeamTrendDataMapper;
import com.acoustic.camps.model.EmployeeModel;
import com.acoustic.camps.model.EmployeeTrendDataModel;
import com.acoustic.camps.model.TeamModel;
import com.acoustic.camps.model.TeamTrendDataModel;
import com.acoustic.camps.repository.EmployeeRepository;
import com.acoustic.camps.repository.EmployeeTrendDataRepository;
import com.acoustic.camps.repository.TeamRepository;
import com.acoustic.camps.repository.TeamTrendDataRepository;
import com.acoustic.camps.service.AnalyticsService;
import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;
import lombok.RequiredArgsConstructor;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * GraphQL fetchers for analytics and reporting
 */
@DgsComponent
@RequiredArgsConstructor
public class AnalyticsDataFetcher {

    private final AnalyticsService analyticsService;
    private final EmployeeTrendDataRepository employeeTrendDataRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeTrendDataMapper employeeTrendDataMapper;
    private final TeamTrendDataRepository teamTrendDataRepository;
    private final TeamRepository teamRepository;
    private final TeamTrendDataMapper teamTrendDataMapper;

    @DgsQuery
    public List<CategoryAverage> teamAverages(
            @InputArgument String teamId,
            @InputArgument OffsetDateTime date,
            @InputArgument Boolean includeStatisticalContext) {

        if (teamId == null) {
            throw new IllegalArgumentException("Team id must be provided");
        }

        return analyticsService.getTeamAveragesWithComparison(UUID.fromString(teamId), date);

        /*
        OffsetDateTime targetDate = (date != null) ? date : OffsetDateTime.now();
        Map<CampsCategory, Double> averages = analyticsService.getTeamAverages(UUID.fromString(teamId), targetDate);

        List<CategoryAverage> result = new ArrayList<>();
        for (Map.Entry<CampsCategory, Double> entry : averages.entrySet()) {
            CategoryAverage avg = new CategoryAverage();
            avg.setCategory(entry.getKey());
            avg.setAverageRating(entry.getValue());
            // We could potentially calculate previous averages too for comparison
            result.add(avg);
        }

        return result;

         */
    }

    @DgsQuery
    public List<TeamStats> teamStats(
            @InputArgument String teamId,
            @InputArgument DateRangeInput dateRange) {

        if (teamId == null || dateRange == null) {
            throw new IllegalArgumentException("Team name and date range must be provided");
        }

        return analyticsService.getTeamStatsByDateRange(
                UUID.fromString(teamId), dateRange.getFromDate(), dateRange.getToDate());
    }

    @DgsQuery
    public List<TrendData> trends(
            @InputArgument String employeeId,
            @InputArgument String teamId,
            @InputArgument CampsCategory category,
            @InputArgument TimePeriod timePeriod) {

        // Validation
        if (employeeId == null && teamId == null) {
            throw new IllegalArgumentException("Either employeeId or teamId must be provided");
        }
        
        if (employeeId != null && teamId != null) {
            throw new IllegalArgumentException("Cannot specify both employeeId and teamId");
        }

        if (timePeriod == null) {
            throw new IllegalArgumentException("TimePeriod must be provided");
        }

        try {
            OffsetDateTime endDate = OffsetDateTime.now();
            OffsetDateTime startDate = switch (timePeriod) {
                case LAST_WEEK -> endDate.minusWeeks(1);
                case LAST_2_WEEKS -> endDate.minusWeeks(2);
                case LAST_4_WEEKS -> endDate.minusWeeks(4);
                case LAST_30_DAYS -> endDate.minusDays(30);
                case LAST_90_DAYS -> endDate.minusDays(90);
                case LAST_6_MONTHS -> endDate.minusMonths(6);
                case LAST_YEAR -> endDate.minusYears(1);
                default -> endDate.minusMonths(6);
            };

            UUID employeeUUID = (employeeId != null) ? UUID.fromString(employeeId) : null;
            UUID teamUUID = (teamId != null) ? UUID.fromString(teamId) : null;

            return analyticsService.getTrends(employeeUUID, teamUUID, category, startDate, endDate);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid input: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("Error retrieving trends: " + e.getMessage(), e);
        }
    }

    @DgsQuery
    public List<EmployeeTrendData> employeeTrends(
            @InputArgument String employeeId,
            @InputArgument CampsCategory category,
            @InputArgument TimePeriod timePeriod,
            @InputArgument DateRangeInput dateRange,
            @InputArgument TrendAnalysisInput trendAnalysis) {

        // Validation
        if (employeeId == null) {
            throw new IllegalArgumentException("employeeId must be provided");
        }

        if (timePeriod == null) {
            throw new IllegalArgumentException("timePeriod must be provided");
        }

        try {
            // Convert employeeId to UUID
            UUID employeeUUID = UUID.fromString(employeeId);

            // Find employee
            EmployeeModel employee = employeeRepository.findById(employeeUUID)
                    .orElseThrow(() -> new IllegalArgumentException("Employee not found with id: " + employeeId));

            // Calculate date range
            OffsetDateTime startDate;
            OffsetDateTime endDate;

            if (dateRange != null) {
                startDate = dateRange.getFromDate();
                endDate = dateRange.getToDate();
            } else {
                endDate = OffsetDateTime.now();
                startDate = switch (timePeriod) {
                    case LAST_WEEK -> endDate.minusWeeks(1);
                    case LAST_2_WEEKS -> endDate.minusWeeks(2);
                    case LAST_4_WEEKS -> endDate.minusWeeks(4);
                    case LAST_30_DAYS -> endDate.minusDays(30);
                    case LAST_90_DAYS -> endDate.minusDays(90);
                    case LAST_6_MONTHS -> endDate.minusMonths(6);
                    case LAST_YEAR -> endDate.minusYears(1);
                    default -> endDate.minusMonths(6);
                };
            }

            // Fetch employee trend data
            List<EmployeeTrendDataModel> trendDataModels;
            if (category != null) {
                trendDataModels = employeeTrendDataRepository
                        .findByEmployeeAndCategoryAndRecordDateBetweenOrderByRecordDateAsc(
                                employee, category, startDate, endDate);
            } else {
                // If no category specified, get all categories for the employee
                // We need to query all categories and combine results
                trendDataModels = new ArrayList<>();
                for (CampsCategory cat : CampsCategory.values()) {
                    List<EmployeeTrendDataModel> categoryData = employeeTrendDataRepository
                            .findByEmployeeAndCategoryAndRecordDateBetweenOrderByRecordDateAsc(
                                    employee, cat, startDate, endDate);
                    trendDataModels.addAll(categoryData);
                }
            }

            // Map to GraphQL DTOs
            return employeeTrendDataMapper.toEmployeeTrendDataList(trendDataModels);

        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid input: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("Error retrieving employee trends: " + e.getMessage(), e);
        }
    }

    @DgsQuery
    public List<TeamTrendData> teamTrends(
            @InputArgument String teamId,
            @InputArgument CampsCategory category,
            @InputArgument TimePeriod timePeriod,
            @InputArgument DateRangeInput dateRange,
            @InputArgument TrendAnalysisInput trendAnalysis) {

        // Validation
        if (teamId == null) {
            throw new IllegalArgumentException("teamId must be provided");
        }

        if (timePeriod == null) {
            throw new IllegalArgumentException("timePeriod must be provided");
        }

        try {
            // Convert teamId to UUID
            UUID teamUUID = UUID.fromString(teamId);

            // Find team
            TeamModel team = teamRepository.findById(teamUUID)
                    .orElseThrow(() -> new IllegalArgumentException("Team not found with id: " + teamId));

            // Calculate date range
            OffsetDateTime startDate, endDate;
            if (dateRange != null) {
                startDate = dateRange.getFromDate();
                endDate = dateRange.getToDate();
            } else {
                endDate = OffsetDateTime.now();
                startDate = switch (timePeriod) {
                    case LAST_WEEK -> endDate.minusWeeks(1);
                    case LAST_2_WEEKS -> endDate.minusWeeks(2);
                    case LAST_4_WEEKS -> endDate.minusWeeks(4);
                    case LAST_30_DAYS -> endDate.minusDays(30);
                    case LAST_90_DAYS -> endDate.minusDays(90);
                    case LAST_6_MONTHS -> endDate.minusMonths(6);
                    case LAST_YEAR -> endDate.minusYears(1);
                    default -> endDate.minusMonths(6);
                };
            }

            // Fetch team trend data
            List<TeamTrendDataModel> trendDataModels;
            if (category != null) {
                trendDataModels = teamTrendDataRepository
                        .findByTeamAndCategoryAndRecordDateBetweenOrderByRecordDateAsc(
                                team, category, startDate, endDate);
            } else {
                // If no category specified, get all categories for the team
                trendDataModels = new ArrayList<>();
                for (CampsCategory cat : CampsCategory.values()) {
                    List<TeamTrendDataModel> categoryData = teamTrendDataRepository
                            .findByTeamAndCategoryAndRecordDateBetweenOrderByRecordDateAsc(
                                    team, cat, startDate, endDate);
                    trendDataModels.addAll(categoryData);
                }
            }

            // Map to GraphQL DTOs
            return teamTrendDataMapper.toTeamTrendDataList(trendDataModels);

        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid input: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("Error retrieving team trends: " + e.getMessage(), e);
        }
    }
}