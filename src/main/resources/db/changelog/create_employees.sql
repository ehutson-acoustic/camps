create table if not exists action_items
(
    id             uuid                                not null,
    employee_id    uuid                                not null,
    category       varchar(20),
    description    text                                not null,
    created_date   date                                not null,
    due_date       date,
    completed_date date,
    status         varchar(20)                         not null,
    outcome        text,
    rating_impact  integer,
    created_by_id  uuid,
    created_at     timestamp default CURRENT_TIMESTAMP not null,
    updated_at     timestamp default CURRENT_TIMESTAMP not null
    );

alter table action_items
    owner to camps;

create index if not exists idx_action_items_employee
    on action_items (employee_id);

create index if not exists idx_action_items_status
    on action_items (status);

create index if not exists idx_action_items_category
    on action_items (category);

create index if not exists idx_action_items_due_date
    on action_items (due_date);

alter table action_items
    add primary key (id);

alter table action_items
    add foreign key (employee_id) references employees
        on delete cascade;

alter table action_items
    add foreign key (created_by_id) references employees;

alter table action_items
    add constraint action_items_category_check
        check ((category)::text = ANY
    ((ARRAY ['CERTAINTY'::character varying, 'AUTONOMY'::character varying, 'MEANING'::character varying, 'PROGRESS'::character varying, 'SOCIAL_INCLUSION'::character varying])::text[]));

alter table action_items
    add constraint action_items_status_check
        check ((status)::text = ANY
    ((ARRAY ['PLANNED'::character varying, 'IN_PROGRESS'::character varying, 'COMPLETED'::character varying, 'CANCELLED'::character varying])::text[]));

alter table action_items
    add constraint action_items_rating_impact_check
        check ((rating_impact >= 1) AND (rating_impact <= 10));