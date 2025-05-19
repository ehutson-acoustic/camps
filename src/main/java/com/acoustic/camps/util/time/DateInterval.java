package com.acoustic.camps.util.time;

import java.time.OffsetDateTime;

/**
 * Defines intervals for date-based aggregations
 */
public enum DateInterval {
    DAILY,
    WEEKLY,
    MONTHLY;

    /**
     * Determines the date interval for aggregation based on the provided date range
     *
     * @param fromDate Start date
     * @param toDate   End date
     * @return DateInterval enum representing the interval type
     */
    public static DateInterval determineInterval(OffsetDateTime fromDate, OffsetDateTime toDate) {
        long daysBetween = java.time.Duration.between(fromDate, toDate).toDays();

        if (daysBetween <= 30) {
            return DateInterval.DAILY;
        } else if (daysBetween <= 365) {
            return DateInterval.WEEKLY;
        } else {
            return DateInterval.MONTHLY;
        }
    }
}