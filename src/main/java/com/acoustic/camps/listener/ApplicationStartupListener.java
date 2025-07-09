package com.acoustic.camps.listener;

import com.acoustic.camps.service.WeeklyTrendCalculationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ApplicationStartupListener {

    private final WeeklyTrendCalculationService trendCalculationService;
    
    @Value("${analytics.startup.calculation.enabled:true}")
    private boolean startupCalculationEnabled;

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        if (!startupCalculationEnabled) {
            log.info("Application is ready. Startup trend calculation is disabled.");
            return;
        }
        
        log.info("Application is ready. Starting trend calculation...");
        
        try {
            trendCalculationService.checkAndCalculateOnStartup();
            log.info("Startup trend calculation completed successfully.");
        } catch (Exception e) {
            log.error("Failed to complete startup trend calculation: {}", e.getMessage(), e);
            log.info("Application will continue despite trend calculation failure.");
        }
    }
}
