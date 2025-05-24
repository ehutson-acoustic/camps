-- Create a table to track weekly analytics snapshots
create table if not exists analytics_processing_log
(
    id              uuid                                not null,
    snapshot_type   varchar(20)                         not null, -- DAILY, WEEKLY, MONTHLY, QUARTERLY
    processing_date timestamp                           not null,
    start_date      timestamp                           not null,
    end_date        timestamp                           not null,
    status          varchar(20)                         not null, -- PENDING, COMPLETED, FAILED
    error_message   text,
    created_at      timestamp default CURRENT_TIMESTAMP not null,
    completed_at    timestamp
);

alter table analytics_processing_log
    owner to camps;

create index if not exists idx_analytics_processing_log_type_date
    on analytics_processing_log (snapshot_type, processing_date);

create index if not exists idx_analytics_processing_log_status
    on analytics_processing_log (status);

alter table analytics_processing_log
    add primary key (id);

alter table analytics_processing_log
    add constraint analytics_processing_log_type_check
        check ((snapshot_type)::text = ANY
               ((ARRAY ['DAILY'::character varying, 'WEEKLY'::character varying, 'MONTHLY'::character varying, 'QUARTERLY'::character varying])::text[]));

alter table analytics_processing_log
    add constraint analytics_processing_log_status_check
        check ((status)::text = ANY
               ((ARRAY ['PENDING'::character varying, 'COMPLETED'::character varying, 'FAILED'::character varying])::text[]));