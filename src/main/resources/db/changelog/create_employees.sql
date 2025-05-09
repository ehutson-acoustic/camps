create table if not exists employees
(
    id         uuid                                not null,
    name       varchar(255)                        not null,
    position   varchar(255),
    team       varchar(255),
    department varchar(255),
    start_date date,
    manager_id uuid,
    created_at timestamp default CURRENT_TIMESTAMP not null,
    updated_at timestamp default CURRENT_TIMESTAMP not null,
    team_id    uuid
);

alter table employees
    owner to camps;

create index if not exists idx_employees_team
    on employees (team);

create index if not exists idx_employees_manager
    on employees (manager_id);

create index if not exists idx_employees_team_id
    on employees (team_id);

alter table employees
    add primary key (id);

alter table employees
    add foreign key (manager_id) references employees;

alter table employees
    add constraint fk_employees_team
        foreign key (team_id) references teams;

