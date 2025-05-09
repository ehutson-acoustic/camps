create table if not exists teams
(
    id          uuid                                not null,
    name        varchar(255)                        not null,
    description text,
    created_at  timestamp default CURRENT_TIMESTAMP not null,
    updated_at  timestamp default CURRENT_TIMESTAMP not null
    );

alter table teams
    owner to camps;

create index if not exists idx_teams_name
    on teams (name);

alter table teams
    add primary key (id);

alter table teams
    add unique (name);

