-- Provides an atomic database command for starting a work session.
--
-- Application code receives BloomBoard domain outcomes instead of interpreting
-- PostgreSQL constraint errors directly.

create or replace function public.start_work_session(
    requested_project_id uuid
)
returns table (
    status text,
    session_id uuid,
    user_id uuid,
    project_id uuid,
    started_at timestamptz,
    ended_at timestamptz,
    active_project_id uuid
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
    authenticated_user_id uuid;
    existing_active_project_id uuid;
begin
    authenticated_user_id := (select auth.uid());

    if authenticated_user_id is null then
        return query
        select
            'unauthorized'::text,
            null::uuid,
            null::uuid,
            null::uuid,
            null::timestamptz,
            null::timestamptz,
            null::uuid;

        return;
    end if;

    -- RLS keeps another user's project indistinguishable from a project that
    -- does not exist, avoiding disclosure of another user's project IDs.
    if not exists (
        select 1
        from public.projects
        where projects.id = requested_project_id
          and projects.user_id = authenticated_user_id
    ) then
        return query
        select
            'not_found'::text,
            null::uuid,
            null::uuid,
            null::uuid,
            null::timestamptz,
            null::timestamptz,
            null::uuid;

        return;
    end if;

    -- This friendly pre-check handles the ordinary case. The partial unique
    -- index remains the final authority if concurrent requests race.
    select work_sessions.project_id
    into existing_active_project_id
    from public.work_sessions
    where work_sessions.user_id = authenticated_user_id
      and work_sessions.ended_at is null
    limit 1;

    if existing_active_project_id is not null then
        return query
        select
            'already_active'::text,
            null::uuid,
            null::uuid,
            null::uuid,
            null::timestamptz,
            null::timestamptz,
            existing_active_project_id;

        return;
    end if;

    begin
        return query
        insert into public.work_sessions (
            user_id,
            project_id
        )
        values (
            authenticated_user_id,
            requested_project_id
        )
        returning
            'success'::text,
            work_sessions.id,
            work_sessions.user_id,
            work_sessions.project_id,
            work_sessions.started_at,
            work_sessions.ended_at,
            null::uuid;

    exception
        when unique_violation then
            /*
             * Another request can win between the pre-check and INSERT.
             * PostgreSQL's named exception is handled here, inside the
             * database boundary, rather than exposing SQLSTATE codes to
             * TypeScript.
             */
            select work_sessions.project_id
            into existing_active_project_id
            from public.work_sessions
            where work_sessions.user_id = authenticated_user_id
              and work_sessions.ended_at is null
            limit 1;

            if existing_active_project_id is null then
                raise;
            end if;

            return query
            select
                'already_active'::text,
                null::uuid,
                null::uuid,
                null::uuid,
                null::timestamptz,
                null::timestamptz,
                existing_active_project_id;
    end;
end;
$$;

-- Functions can otherwise inherit broad EXECUTE privileges. BloomBoard exposes
-- this command only to signed-in users.
revoke all on function public.start_work_session(uuid) from public;
revoke all on function public.start_work_session(uuid) from anon;

grant execute
on function public.start_work_session(uuid)
to authenticated;