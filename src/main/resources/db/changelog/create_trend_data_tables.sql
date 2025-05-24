-- Create the team_trend_data table
create table if not exists team_trend_data
(
    id                          uuid                                not null primary key ,
    team_id                     uuid                                not null,
    record_date                 date                                not null,
    category                    varchar(20)                         not null,
    average_rating              numeric(4, 2)                       not null,
    previous_average_rating     numeric(4, 2),
    week_over_week_change       numeric(4, 2),
    month_over_month_change     numeric(4, 2),
    quarter_over_quarter_change numeric(4, 2),
    year_over_year_change       numeric(4, 2),
    employee_count              integer,
    data_points                 integer,
    created_at                  timestamp default CURRENT_TIMESTAMP not null
);

alter table team_trend_data
    owner to camps;

create index if not exists idx_team_trend_data_team
    on team_trend_data (team_id);

create index if not exists idx_team_trend_data_date
    on team_trend_data (record_date);

create index if not exists idx_team_trend_data_category
    on team_trend_data (category);

create index if not exists idx_team_trend_data_team_date
    on team_trend_data (team_id, record_date);

alter table team_trend_data
    add constraint fk_team_trend_data_team
        foreign key (team_id) references teams;

alter table team_trend_data
    add constraint team_trend_data_category_check
        check ((category)::text = ANY
               ((ARRAY ['CERTAINTY'::character varying, 'AUTONOMY'::character varying, 'MEANING'::character varying, 'PROGRESS'::character varying, 'SOCIAL_INCLUSION'::character varying])::text[]));

-- Create employee_trend_data table
create table if not exists employee_trend_data
(
    id                          uuid                                not null primary key,
    employee_id                 uuid                                not null,
    team_id                     uuid,
    record_date                 date                                not null,
    category                    varchar(20)                         not null,
    rating                      numeric(4, 2)                       not null,
    previous_rating             numeric(4, 2),
    week_over_week_change       numeric(4, 2),
    month_over_month_change     numeric(4, 2),
    quarter_over_quarter_change numeric(4, 2),
    year_over_year_change       numeric(4, 2),
    created_at                  timestamp default CURRENT_TIMESTAMP not null
);

alter table employee_trend_data
    owner to camps;

create index if not exists idx_employee_trend_data_employee
    on employee_trend_data (employee_id);

create index if not exists idx_employee_trend_data_team
    on employee_trend_data (team_id);

create index if not exists idx_employee_trend_data_date
    on employee_trend_data (record_date);

create index if not exists idx_employee_trend_data_category
    on employee_trend_data (category);

create index if not exists idx_employee_trend_data_employee_date
    on employee_trend_data (employee_id, record_date);

alter table employee_trend_data
    add constraint fk_employee_trend_data_employee
        foreign key (employee_id) references employees
            on delete cascade;

alter table employee_trend_data
    add constraint fk_employee_trend_data_team
        foreign key (team_id) references teams;

alter table employee_trend_data
    add constraint employee_trend_data_category_check
        check ((category)::text = ANY
               ((ARRAY ['CERTAINTY'::character varying, 'AUTONOMY'::character varying, 'MEANING'::character varying, 'PROGRESS'::character varying, 'SOCIAL_INCLUSION'::character varying])::text[]));


-- Add indexes to support efficient weekly calculations
create index if not exists idx_team_trend_data_team_category_date
    on team_trend_data (team_id, category, record_date);

create index if not exists idx_employee_trend_data_employee_category_date
    on employee_trend_data (employee_id, category, record_date);