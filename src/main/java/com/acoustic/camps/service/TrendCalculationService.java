package com.acoustic.camps.service;

import com.acoustic.camps.codegen.types.CampsCategory;
import com.acoustic.camps.model.TeamModel;
import com.acoustic.camps.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Service for managing trend data calculations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TrendCalculationService {

    private final AnalyticsService analyticsService;
    private final TeamRepository teamRepository;
    
    // Progress tracking for long-running calculations
    private final AtomicInteger calculationProgress = new AtomicInteger(0);
    private volatile int totalCalculations = 0;
    private volatile boolean calculationInProgress = false;

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
            // Validate input
            if (teamId == null) {
                throw new IllegalArgumentException("Team ID cannot be null");
            }
            
            TeamModel team = teamRepository.findById(teamId)
                    .orElseThrow(() -> new IllegalArgumentException("Team not found with ID: " + teamId));

            // Set up progress tracking
            calculationInProgress = true;
            totalCalculations = CampsCategory.values().length;
            calculationProgress.set(0);
            
            log.info("Starting trend calculation for team: {} ({})", team.getName(), teamId);

            OffsetDateTime now = OffsetDateTime.now();

            // Calculate and save trend data for each category with progress tracking
            for (CampsCategory category : CampsCategory.values()) {
                try {
                    analyticsService.generateTeamTrendData(
                            team,
                            category,
                            now,
                            now.minusMonths(1),
                            now.minusMonths(3),
                            now.minusYears(1)
                    );
                    
                    // Update progress
                    int progress = calculationProgress.incrementAndGet();
                    log.debug("Progress: {}/{} categories completed for team {}", 
                            progress, totalCalculations, team.getName());
                    
                } catch (Exception e) {
                    log.error("Error calculating trend for team {} category {}: {}", 
                            team.getName(), category, e.getMessage(), e);
                    // Continue with other categories
                }
            }

            calculationInProgress = false;
            log.info("Async trend calculation completed for team ID: {}", teamId);
            return CompletableFuture.completedFuture(true);
        } catch (Exception e) {
            calculationInProgress = false;
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
            
            if (teams.isEmpty()) {
                log.warn("No teams found for trend calculation");
                return CompletableFuture.completedFuture(true);
            }

            // Set up progress tracking
            calculationInProgress = true;
            totalCalculations = teams.size() * CampsCategory.values().length;
            calculationProgress.set(0);
            
            log.info("Calculating trends for {} teams", teams.size());

            // Process teams in batches to avoid overwhelming the system
            final int batchSize = 5;
            boolean overallSuccess = true;
            
            for (int i = 0; i < teams.size(); i += batchSize) {
                int endIndex = Math.min(i + batchSize, teams.size());
                List<TeamModel> batch = teams.subList(i, endIndex);
                
                log.debug("Processing batch {}/{}: teams {} to {}", 
                        (i / batchSize) + 1, 
                        (teams.size() + batchSize - 1) / batchSize,
                        i + 1, 
                        endIndex);
                
                // Process batch with parallel streams for better performance
                boolean batchSuccess = batch.parallelStream()
                        .allMatch(team -> {
                            try {
                                return calculateTeamTrendsSync(team);
                            } catch (Exception e) {
                                log.error("Error calculating trends for team {}: {}", 
                                        team.getName(), e.getMessage(), e);
                                return false;
                            }
                        });
                
                if (!batchSuccess) {
                    overallSuccess = false;
                }
                
                // Small delay between batches to prevent system overload
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    log.warn("Interrupted during batch processing");
                    break;
                }
            }

            calculationInProgress = false;
            log.info("Async trend calculation completed for all teams. Success: {}", overallSuccess);
            return CompletableFuture.completedFuture(overallSuccess);
        } catch (Exception e) {
            calculationInProgress = false;
            log.error("Error initiating trend calculations for all teams: {}", e.getMessage(), e);
            return CompletableFuture.completedFuture(false);
        }
    }
    
    /**
     * Synchronous helper method for calculating team trends
     * Used internally by the async batch processing
     */
    private boolean calculateTeamTrendsSync(TeamModel team) {
        try {
            OffsetDateTime now = OffsetDateTime.now();
            
            for (CampsCategory category : CampsCategory.values()) {
                try {
                    analyticsService.generateTeamTrendData(
                            team,
                            category,
                            now,
                            now.minusMonths(1),
                            now.minusMonths(3),
                            now.minusYears(1)
                    );
                    
                    // Update progress
                    int progress = calculationProgress.incrementAndGet();
                    if (progress % 10 == 0) { // Log every 10th completion to avoid spam
                        log.debug("Progress: {}/{} calculations completed", 
                                progress, totalCalculations);
                    }
                    
                } catch (Exception e) {
                    log.error("Error calculating trend for team {} category {}: {}", 
                            team.getName(), category, e.getMessage(), e);
                    // Continue with other categories
                }
            }
            
            return true;
        } catch (Exception e) {
            log.error("Error calculating trends for team {}: {}", team.getName(), e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Get the current calculation progress
     * 
     * @return Progress information including percentage complete
     */
    public CalculationProgress getCalculationProgress() {
        return new CalculationProgress(
                calculationInProgress,
                calculationProgress.get(),
                totalCalculations,
                totalCalculations > 0 ? (double) calculationProgress.get() / totalCalculations * 100 : 0
        );
    }
    
    /**
     * Progress information for trend calculations
     */
    public static class CalculationProgress {
        private final boolean inProgress;
        private final int completed;
        private final int total;
        private final double percentComplete;
        
        public CalculationProgress(boolean inProgress, int completed, int total, double percentComplete) {
            this.inProgress = inProgress;
            this.completed = completed;
            this.total = total;
            this.percentComplete = percentComplete;
        }
        
        public boolean isInProgress() { return inProgress; }
        public int getCompleted() { return completed; }
        public int getTotal() { return total; }
        public double getPercentComplete() { return percentComplete; }
        
        @Override
        public String toString() {
            return String.format("CalculationProgress{inProgress=%s, completed=%d, total=%d, percentComplete=%.1f%%}", 
                    inProgress, completed, total, percentComplete);
        }
    }
}