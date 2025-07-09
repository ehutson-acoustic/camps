// src/main/java/com/acoustic/camps/graphql/AdminDataFetcher.java
package com.acoustic.camps.graphql;

import com.acoustic.camps.codegen.types.CalculationResult;
import com.acoustic.camps.service.TrendCalculationService;
import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.InputArgument;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * GraphQL fetchers for admin operations
 */
@DgsComponent
@RequiredArgsConstructor
@Slf4j
public class AdminDataFetcher {

    private final TrendCalculationService trendCalculationService;

    @DgsMutation
    public CalculationResult recalculateWeeklyTrends(@InputArgument String teamId) {
        log.info("Admin request to recalculate trends for team ID: {}", teamId);

        CalculationResult result = new CalculationResult();

        try {
            if (teamId != null && !teamId.trim().isEmpty()) {
                // Validate teamId format
                UUID teamUUID;
                try {
                    teamUUID = UUID.fromString(teamId);
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid team ID format: {}", teamId);
                    result.setSuccess(false);
                    result.setMessage("Invalid team ID format: " + teamId);
                    result.setErrors(List.of("Team ID must be a valid UUID"));
                    return result;
                }

                // Trigger calculation for specific team
                log.info("Starting trend calculation for team: {}", teamUUID);
                CompletableFuture<Boolean> future = trendCalculationService.calculateTeamTrendsAsync(teamUUID);

                result.setSuccess(true);
                result.setMessage("Trend calculation started for team ID: " + teamId);
                result.setCalculatedRecords(1); // One team being processed
            } else {
                // Trigger calculation for all teams
                log.info("Starting trend calculation for all teams");
                CompletableFuture<Boolean> future = trendCalculationService.calculateAllTeamTrendsAsync();

                result.setSuccess(true);
                result.setMessage("Trend calculation started for all teams");
                result.setCalculatedRecords(null); // Will be determined during execution
            }
        } catch (IllegalArgumentException e) {
            log.error("Invalid argument for trend calculation: {}", e.getMessage(), e);
            result.setSuccess(false);
            result.setMessage("Invalid input: " + e.getMessage());
            result.setErrors(List.of(e.getMessage()));
        } catch (Exception e) {
            log.error("Error triggering trend calculation: {}", e.getMessage(), e);
            result.setSuccess(false);
            result.setMessage("Failed to trigger trend calculation: " + e.getMessage());
            result.setErrors(List.of("Internal server error: " + e.getMessage()));
        }

        return result;
    }
}