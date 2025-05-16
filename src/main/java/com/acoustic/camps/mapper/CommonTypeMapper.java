package com.acoustic.camps.mapper;

import org.mapstruct.Named;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * Common type mapper for shared conversions across multiple mappers
 * This class contains specialized conversion methods that can be reused by
 * different mapper interfaces.
 */
@Component
public class CommonTypeMapper {

    /**
     * Converts String UUID to a UUID object
     *
     * @param id String representation of UUID
     * @return UUID object
     */
    @Named("stringToUUID")
    public UUID stringToUUID(String id) {
        if (id == null) {
            return null;
        }
        return UUID.fromString(id);
    }

    /**
     * Converts UUID to String
     *
     * @param id UUID object
     * @return String representation of UUID
     */
    @Named("uuidToString")
    public String uuidToString(UUID id) {
        if (id == null) {
            return null;
        }
        return id.toString();
    }

    /**
     * Formats a LocalDate to a standard date string format
     *
     * @param date LocalDate object
     * @return formatted date string
     */
    @Named("formatDate")
    public String formatDate(LocalDate date) {
        if (date == null) {
            return null;
        }
        return date.format(DateTimeFormatter.ISO_DATE);
    }

    /**
     * Parses a date string to a LocalDate
     *
     * @param dateString date string in ISO format
     * @return LocalDate object
     */
    @Named("parseDate")
    public LocalDate parseDate(String dateString) {
        if (dateString == null || dateString.isEmpty()) {
            return null;
        }
        return LocalDate.parse(dateString, DateTimeFormatter.ISO_DATE);
    }

    /**
     * Formats a LocalDateTime to a standard timestamp string format
     *
     * @param dateTime LocalDateTime object
     * @return formatted timestamp string
     */
    @Named("formatDateTime")
    public String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.format(DateTimeFormatter.ISO_DATE_TIME);
    }

    /**
     * Parses a timestamp string to a LocalDateTime
     *
     * @param dateTimeString timestamp string in ISO format
     * @return LocalDateTime object
     */
    @Named("parseDateTime")
    public LocalDateTime parseDateTime(String dateTimeString) {
        if (dateTimeString == null || dateTimeString.isEmpty()) {
            return null;
        }
        return LocalDateTime.parse(dateTimeString, DateTimeFormatter.ISO_DATE_TIME);
    }

    /**
     * Converts a Double to a formatted string with 2 decimal places
     *
     * @param value Double value
     * @return formatted string
     */
    @Named("doubleToString")
    public String doubleToString(Double value) {
        if (value == null) {
            return null;
        }
        return String.format("%.2f", value);
    }

    /**
     * Parses a string to a Double
     *
     * @param value String representation of a double
     * @return Double value
     */
    @Named("stringToDouble")
    public Double stringToDouble(String value) {
        if (value == null || value.isEmpty()) {
            return null;
        }
        return Double.valueOf(value);
    }

    /**
     * Converts a {@link LocalDateTime} to an {@link OffsetDateTime}.
     *
     * @param value the {@link LocalDateTime} to convert
     * @return the converted {@link OffsetDateTime}, or {@code null} if the input is {@code null}
     */
    public OffsetDateTime map(LocalDateTime value) {
        if (value == null) {
            return null;
        }
        return value.atOffset(OffsetDateTime.now().getOffset());
    }

    /**
     * Converts an {@link OffsetDateTime} to a {@link LocalDateTime}.
     *
     * @param value the {@link OffsetDateTime} to convert
     * @return the converted {@link LocalDateTime}, or {@code null} if the input is {@code null}
     */
    public LocalDateTime map(OffsetDateTime value) {
        if (value == null) {
            return null;
        }
        return value.toLocalDateTime();
    }
}
