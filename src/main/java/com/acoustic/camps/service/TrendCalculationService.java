package com.acoustic.camps.service;

import com.acoustic.camps.codegen.types.CampsCategory;
import com.acoustic.camps.model.TeamModel;
import com.acoustic.camps.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Service for managing trend data calculations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TrendCalculationService {

    private final AnalyticsService analyticsService;
    private final TeamRepository teamRepository;

    /**
     * Admin API to trigger calculation for a specific team regardless of time since last calculation
     *
     * @param teamId The team's ID
     * @return CompletableFuture that completes when calculation is done
     */
    @Async
    public CompletableFuture<Boolean> calculateTeamTrendsAsync(UUID teamId) {
        log.info("Starting async trend calculation for team ID: {}", teamId);

        try {
            TeamModel team = teamRepository.findById(teamId)
                    .orElseThrow(() -> new IllegalArgumentException("Team not found with ID: " + teamId));

            OffsetDateTime now = OffsetDateTime.now();

            // Calculate and save trend data for each category
            for (CampsCategory category : CampsCategory.values()) {
                analyticsService.generateTeamTrendData(
                        team,
                        category,
                        now,
                        now.minusMonths(1),
                        now.minusMonths(3),
                        now.minusYears(1)
                );
            }

            log.info("Async trend calculation completed for team ID: {}", teamId);
            return CompletableFuture.completedFuture(true);
        } catch (Exception e) {
            log.error("Error during async trend calculation for team {}: {}", teamId, e.getMessage(), e);
            return CompletableFuture.completedFuture(false);
        }
    }

    /**
     * Admin API to trigger calculation for all teams regardless of time since last calculation
     *
     * @return CompletableFuture that completes when all calculations are done
     */
    @Async
    public CompletableFuture<Boolean> calculateAllTeamTrendsAsync() {
        log.info("Starting async trend calculation for all teams");

        try {
            List<TeamModel> teams = teamRepository.findAll();

            for (TeamModel team : teams) {
                calculateTeamTrendsAsync(team.getId());
            }

            log.info("Async trend calculation triggered for all teams");
            return CompletableFuture.completedFuture(true);
        } catch (Exception e) {
            log.error("Error initiating trend calculations for all teams: {}", e.getMessage(), e);
            return CompletableFuture.completedFuture(false);
        }
    }


}