-- BloomBoard initial database schema.
--
-- This migration is intended for a fresh Supabase database. If the remote
-- project already contains these objects, verify that its schema matches this
-- migration before recording the migration as an existing baseline.

create type public.project_status as enum (
    'working',
    'postponed',
    'finished',
    'abandoned'
);

create table public.projects (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    name text not null check (length(trim(name)) > 0),
    description text not null default '',
    status public.project_status not null default 'working',
    github_repo_url text,
    created_at timestamptz not null default now()
);

create table public.project_tasks (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references public.projects (id) on delete cascade,
    title text not null check (length(trim(title)) > 0),
    is_done boolean not null default false,
    created_at timestamptz not null default now(),
    constraint project_tasks_project_id_id_key unique (project_id, id)
);

create table public.project_notes (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references public.projects (id) on delete cascade,
    task_id uuid,
    body text not null check (length(trim(body)) > 0),
    created_at timestamptz not null default now(),
    -- The composite relationship prevents a note from referencing a task that
    -- belongs to a different project. Deleting a task preserves the note.
    constraint project_notes_project_task_fkey
        foreign key (project_id, task_id)
        references public.project_tasks (project_id, id)
        on delete set null (task_id)
);

create table public.work_sessions (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references public.projects (id) on delete cascade,
    started_at timestamptz not null default now(),
    ended_at timestamptz,
    constraint work_sessions_valid_time_range
        check (ended_at is null or ended_at >= started_at)
);

-- Support the ownership checks and the application's current filter/order
-- patterns. Primary and unique keys already provide their own indexes.
create index projects_user_created_at_idx
    on public.projects (user_id, created_at desc);

create index project_tasks_project_created_at_idx
    on public.project_tasks (project_id, created_at);

create index project_notes_project_created_at_idx
    on public.project_notes (project_id, created_at desc);

create index project_notes_task_id_idx
    on public.project_notes (task_id);

create index work_sessions_project_started_at_idx
    on public.work_sessions (project_id, started_at desc);

alter table public.projects enable row level security;
alter table public.project_tasks enable row level security;
alter table public.project_notes enable row level security;
alter table public.work_sessions enable row level security;

-- Signed-out clients do not need direct access to application data.
revoke all on table public.projects from anon;
revoke all on table public.project_tasks from anon;
revoke all on table public.project_notes from anon;
revoke all on table public.work_sessions from anon;
revoke all on type public.project_status from anon;

-- Signed-in clients receive only the operations exposed by BloomBoard. RLS
-- still decides which individual rows each authenticated user can access.
grant select, insert, update, delete on table public.projects to authenticated;
grant select, insert, update, delete on table public.project_tasks to authenticated;
grant select, insert, update, delete on table public.project_notes to authenticated;
grant select, insert, update, delete on table public.work_sessions to authenticated;
grant usage on type public.project_status to authenticated;

create policy "Select own projects"
on public.projects
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Insert own projects"
on public.projects
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Update own projects"
on public.projects
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Delete own projects"
on public.projects
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "Select tasks of own projects"
on public.project_tasks
for select
to authenticated
using (
    exists (
        select 1
        from public.projects
        where projects.id = project_tasks.project_id
          and projects.user_id = (select auth.uid())
    )
);

create policy "Insert tasks into own projects"
on public.project_tasks
for insert
to authenticated
with check (
    exists (
        select 1
        from public.projects
        where projects.id = project_tasks.project_id
          and projects.user_id = (select auth.uid())
    )
);

create policy "Update tasks of own projects"
on public.project_tasks
for update
to authenticated
using (
    exists (
        select 1
        from public.projects
        where projects.id = project_tasks.project_id
          and projects.user_id = (select auth.uid())
    )
)
with check (
    exists (
        select 1
        from public.projects
        where projects.id = project_tasks.project_id
          and projects.user_id = (select auth.uid())
    )
);

create policy "Delete tasks of own projects"
on public.project_tasks
for delete
to authenticated
using (
    exists (
        select 1
        from public.projects
        where projects.id = project_tasks.project_id
          and projects.user_id = (select auth.uid())
    )
);

create policy "Select notes of own projects"
on public.project_notes
for select
to authenticated
using (
    exists (
        select 1
        from public.projects
        where projects.id = project_notes.project_id
          and projects.user_id = (select auth.uid())
    )
);

create policy "Insert notes into own projects"
on public.project_notes
for insert
to authenticated
with check (
    exists (
        select 1
        from public.projects
        where projects.id = project_notes.project_id
          and projects.user_id = (select auth.uid())
    )
);

create policy "Update notes of own projects"
on public.project_notes
for update
to authenticated
using (
    exists (
        select 1
        from public.projects
        where projects.id = project_notes.project_id
          and projects.user_id = (select auth.uid())
    )
)
with check (
    exists (
        select 1
        from public.projects
        where projects.id = project_notes.project_id
          and projects.user_id = (select auth.uid())
    )
);

create policy "Delete notes of own projects"
on public.project_notes
for delete
to authenticated
using (
    exists (
        select 1
        from public.projects
        where projects.id = project_notes.project_id
          and projects.user_id = (select auth.uid())
    )
);

create policy "Select work sessions of own projects"
on public.work_sessions
for select
to authenticated
using (
    exists (
        select 1
        from public.projects
        where projects.id = work_sessions.project_id
          and projects.user_id = (select auth.uid())
    )
);

create policy "Insert work sessions into own projects"
on public.work_sessions
for insert
to authenticated
with check (
    exists (
        select 1
        from public.projects
        where projects.id = work_sessions.project_id
          and projects.user_id = (select auth.uid())
    )
);

create policy "Update work sessions of own projects"
on public.work_sessions
for update
to authenticated
using (
    exists (
        select 1
        from public.projects
        where projects.id = work_sessions.project_id
          and projects.user_id = (select auth.uid())
    )
)
with check (
    exists (
        select 1
        from public.projects
        where projects.id = work_sessions.project_id
          and projects.user_id = (select auth.uid())
    )
);

create policy "Delete work sessions of own projects"
on public.work_sessions
for delete
to authenticated
using (
    exists (
        select 1
        from public.projects
        where projects.id = work_sessions.project_id
          and projects.user_id = (select auth.uid())
    )
);
