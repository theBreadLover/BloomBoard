-- Give work sessions direct user ownership and enforce one active session
-- per user across all BloomBoard projects.

-- Existing rows need to be backfilled before user_id can become required.
alter table public.work_sessions
add column user_id uuid;

update public.work_sessions
set user_id = projects.user_id
from public.projects
where projects.id = work_sessions.project_id;

alter table public.work_sessions
alter column user_id set not null;

alter table public.work_sessions
add constraint work_sessions_user_id_fkey
foreign key (user_id)
references auth.users (id)
on delete cascade;

-- A composite project key lets the database prove that a session's user_id
-- actually owns its project_id.
alter table public.projects
add constraint projects_user_id_id_key
unique (user_id, id);

-- Replace the original project-only foreign key with one that also verifies
-- project ownership.
alter table public.work_sessions
drop constraint if exists work_sessions_project_id_fkey;

alter table public.work_sessions
add constraint work_sessions_user_project_fkey
foreign key (user_id, project_id)
references public.projects (user_id, id)
on delete cascade;

-- Concurrent requests from different tabs cannot create two active sessions
-- for the same user.
create unique index work_sessions_one_active_per_user_idx
on public.work_sessions (user_id)
where ended_at is null;

-- Supports active-session lookup and user session history.
create index work_sessions_user_started_at_idx
on public.work_sessions (user_id, started_at desc);

-- Historical sessions are read-only to authenticated clients. A running
-- session may update only ended_at when it is stopped.
revoke update, delete
on table public.work_sessions
from authenticated;

grant update (ended_at)
on table public.work_sessions
to authenticated;

drop policy if exists "Select work sessions of own projects"
on public.work_sessions;

drop policy if exists "Insert work sessions into own projects"
on public.work_sessions;

drop policy if exists "Update work sessions of own projects"
on public.work_sessions;

drop policy if exists "Delete work sessions of own projects"
on public.work_sessions;

create policy "Select own work sessions"
on public.work_sessions
for select
to authenticated
using (
    (select auth.uid()) = user_id
);

create policy "Insert own work sessions"
on public.work_sessions
for insert
to authenticated
with check (
    (select auth.uid()) = user_id
    and exists (
        select 1
        from public.projects
        where projects.id = work_sessions.project_id
          and projects.user_id = (select auth.uid())
    )
);

create policy "Update own active work sessions"
on public.work_sessions
for update
to authenticated
using (
    (select auth.uid()) = user_id
    and ended_at is null
)
with check (
    (select auth.uid()) = user_id
);