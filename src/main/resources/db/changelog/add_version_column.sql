-- Add version column for optimistic locking to analytics_processing_log table
ALTER TABLE analytics_processing_log ADD COLUMN version BIGINT DEFAULT 0;