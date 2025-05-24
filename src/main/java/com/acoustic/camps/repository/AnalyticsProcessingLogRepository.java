package com.acoustic.camps.repository;

import com.acoustic.camps.model.AnalyticsProcessingLogModel;
import com.acoustic.camps.model.enums.ProcessingStatus;
import com.acoustic.camps.model.enums.SnapshotType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for tracking analytics processing jobs
 */
@Repository
public interface AnalyticsProcessingLogRepository extends JpaRepository<AnalyticsProcessingLogModel, UUID> {

    /**
     * Find the most recent processing log by type and status
     *
     * @param snapshotType The type of snapshot
     * @param status       The processing status
     * @return The most recent log entry
     */
    Optional<AnalyticsProcessingLogModel> findTopBySnapshotTypeAndStatusOrderByProcessingDateDesc(
            SnapshotType snapshotType, ProcessingStatus status);

    /**
     * Find all processing logs for a specific date range
     *
     * @param fromDate Start date (inclusive)
     * @param toDate   End date (inclusive)
     * @return List of processing logs
     */
    List<AnalyticsProcessingLogModel> findByProcessingDateBetweenOrderByProcessingDateDesc(
            OffsetDateTime fromDate, OffsetDateTime toDate);

    /**
     * Find all processing logs for a specific type and date range
     *
     * @param snapshotType The type of snapshot
     * @param fromDate     Start date (inclusive)
     * @param toDate       End date (inclusive)
     * @return List of processing logs
     */
    List<AnalyticsProcessingLogModel> findBySnapshotTypeAndProcessingDateBetweenOrderByProcessingDateDesc(
            SnapshotType snapshotType, OffsetDateTime fromDate, OffsetDateTime toDate);

    /**
     * Find all pending processing jobs
     *
     * @return List of pending jobs
     */
    List<AnalyticsProcessingLogModel> findByStatusOrderByProcessingDateAsc(ProcessingStatus status);
}