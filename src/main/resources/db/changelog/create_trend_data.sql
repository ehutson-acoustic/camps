create table if not exists trend_data
(
    id                          uuid                                not null,
    employee_id                 uuid,
    record_date                 date                                not null,
    category                    varchar(20)                         not null,
    average_rating              numeric(4, 2)                       not null,
    month_over_month_change     numeric(4, 2),
    quarter_over_quarter_change numeric(4, 2),
    year_over_year_change       numeric(4, 2),
    created_at                  timestamp default CURRENT_TIMESTAMP not null,
    team_id                     uuid
    );

alter table trend_data
    owner to camps;

create index if not exists idx_trend_data_employee
    on trend_data (employee_id);

create index if not exists idx_trend_data_date
    on trend_data (record_date);

create index if not exists idx_trend_data_team_id
    on trend_data (team_id);

alter table trend_data
    add primary key (id);

alter table trend_data
    add foreign key (employee_id) references employees
        on delete cascade;

alter table trend_data
    add constraint fk_trend_data_team
        foreign key (team_id) references teams;

alter table trend_data
    add constraint trend_data_category_check
        check ((category)::text = ANY
    ((ARRAY ['CERTAINTY'::character varying, 'AUTONOMY'::character varying, 'MEANING'::character varying, 'PROGRESS'::character varying, 'SOCIAL_INCLUSION'::character varying])::text[]));

