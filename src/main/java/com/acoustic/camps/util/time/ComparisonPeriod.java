package com.acoustic.camps.util.time;

import java.time.OffsetDateTime;

public enum ComparisonPeriod {
    WEEK,
    MONTH,
    QUARTER,
    YEAR;

    /**
     * Calculates the start date of the previous period based on the given date and period type.
     *
     * @param date   The date to calculate from.
     * @param period The period type (WEEK, MONTH, QUARTER, YEAR).
     * @return The start date of the previous period.
     */
    public static OffsetDateTime calculatePreviousPeriod(OffsetDateTime date, ComparisonPeriod period) {
        return switch (period) {
            case WEEK -> date.minusWeeks(1);
            case MONTH -> date.minusMonths(1);
            case QUARTER -> date.minusMonths(3);
            case YEAR -> date.minusYears(1);
        };
    }
}
