package com.acoustic.camps.graphql;

import com.acoustic.camps.codegen.types.CampsCategory;
import com.acoustic.camps.codegen.types.CategoryAverage;
import com.acoustic.camps.codegen.types.DateRangeInput;
import com.acoustic.camps.codegen.types.TeamStats;
import com.acoustic.camps.codegen.types.TimePeriod;
import com.acoustic.camps.codegen.types.TrendData;
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

    @DgsQuery
    public List<CategoryAverage> teamAverages(
            @InputArgument String teamId,
            @InputArgument OffsetDateTime date) {

        if (teamId == null) {
            throw new IllegalArgumentException("Team name must be provided");
        }

        OffsetDateTime targetDate = (date != null) ? date : OffsetDateTime.now();
        Map<CampsCategory, Double> averages = analyticsService.getTeamAverages(UUID.fromString(teamId), targetDate);

        List<CategoryAverage> result = new ArrayList<>();
        for (Map.Entry<CampsCategory, Double> entry : averages.entrySet()) {
            CategoryAverage avg = new CategoryAverage();
            avg.setCategory(entry.getKey());
            avg.setAverageRating(entry.getValue());
            // TODO Previous rating would need additional query - simplified for now
            result.add(avg);
        }

        return result;
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

        OffsetDateTime endDate = OffsetDateTime.now();
        OffsetDateTime startDate = switch (timePeriod) {
            case LAST_30_DAYS -> endDate.minusDays(30);
            case LAST_90_DAYS -> endDate.minusDays(90);
            case LAST_YEAR -> endDate.minusYears(1);
            default -> endDate.minusMonths(6);
        };

        UUID employeeUUID = (employeeId != null) ? UUID.fromString(employeeId) : null;

        return analyticsService.getTrends(employeeUUID, UUID.fromString(teamId), category, startDate, endDate);
    }
}