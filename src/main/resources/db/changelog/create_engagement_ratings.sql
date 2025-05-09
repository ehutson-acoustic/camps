create table if not exists engagement_ratings
(
    id            uuid                                not null,
    employee_id   uuid                                not null,
    rating_date   date                                not null,
    category      varchar(20)                         not null,
    rating        integer                             not null,
    notes         text,
    created_by_id uuid,
    created_at    timestamp default CURRENT_TIMESTAMP not null
    );

alter table engagement_ratings
    owner to camps;

create index if not exists idx_ratings_employee_category
    on engagement_ratings (employee_id, category);

create index if not exists idx_ratings_date
    on engagement_ratings (rating_date);

create index if not exists idx_ratings_employee_date
    on engagement_ratings (employee_id, rating_date);

alter table engagement_ratings
    add primary key (id);

alter table engagement_ratings
    add foreign key (employee_id) references employees
        on delete cascade;

alter table engagement_ratings
    add foreign key (created_by_id) references employees;

alter table engagement_ratings
    add constraint engagement_ratings_category_check
        check ((category)::text = ANY
    ((ARRAY ['CERTAINTY'::character varying, 'AUTONOMY'::character varying, 'MEANING'::character varying, 'PROGRESS'::character varying, 'SOCIAL_INCLUSION'::character varying])::text[]));

alter table engagement_ratings
    add constraint engagement_ratings_rating_check
        check ((rating >= 1) AND (rating <= 10));

