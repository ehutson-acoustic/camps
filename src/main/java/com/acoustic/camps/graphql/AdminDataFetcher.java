// src/main/java/com/acoustic/camps/graphql/AdminDataFetcher.java
package com.acoustic.camps.graphql;

import com.acoustic.camps.codegen.types.CalculationResult;
import com.acoustic.camps.service.TrendCalculationService;
import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.InputArgument;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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

    //@DgsMutation
    public CalculationResult recalculateTrends(@InputArgument String teamId) {
        log.info("Admin request to recalculate trends for team ID: {}", teamId);

        CalculationResult result = new CalculationResult();

        try {
            if (teamId != null) {
                // Trigger calculation for specific team
                CompletableFuture<Boolean> future = trendCalculationService.calculateTeamTrendsAsync(UUID.fromString(teamId));

                // We're not waiting for completion since it's async
                result.setSuccess(true);
                result.setMessage("Trend calculation started for team ID: " + teamId);
            } else {
                // Trigger calculation for all teams
                CompletableFuture<Boolean> future = trendCalculationService.calculateAllTeamTrendsAsync();

                result.setSuccess(true);
                result.setMessage("Trend calculation started for all teams");
            }
        } catch (Exception e) {
            log.error("Error triggering trend calculation: {}", e.getMessage(), e);
            result.setSuccess(false);
            result.setMessage("Failed to trigger trend calculation: " + e.getMessage());
        }

        return result;
    }
}