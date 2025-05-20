package com.acoustic.camps.listener;

import com.acoustic.camps.service.TrendCalculationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ApplicationStartupListener {

    private final TrendCalculationService trendCalculationService;

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        log.info("Application is ready. Starting trend calculation...");
        trendCalculationService.checkAndCalculateOnStartup();
    }
}
