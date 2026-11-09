import {createClient} from "@/lib/supabase/server";
import type {
	ActiveWorkSession,
	WorkSession,
} from "@/types/project";

interface WorkSessionRow {
	id: string;
	user_id: string;
	project_id: string;
	started_at: string;
	ended_at: string | null;
}

interface ActiveWorkSessionRow extends WorkSessionRow {
	projects: {
		name: string;
	}[];
}

/**
 * Converts a database work-session row from snake_case into the application's
 * camelCase WorkSession type.
 *
 * @param row - A work-session row returned by Supabase.
 * @returns The mapped application work session.
 */
function mapWorkSessionRow(row: WorkSessionRow): WorkSession {
	return {
		id: row.id,
		userId: row.user_id,
		projectId: row.project_id,
		startedAt: row.started_at,
		endedAt: row.ended_at,
	};
}

/**
 * Converts an active work-session row and its joined project metadata into the
 * application type used to identify the project currently being tracked.
 *
 * @param row - An active work-session row with its owning project.
 * @returns The mapped active session and project name, or null if project metadata is missing.
 */
function mapActiveWorkSessionRow(
	row: ActiveWorkSessionRow,
): ActiveWorkSession | null {
	const project = row.projects[0];
	if (!project) {
		return null;
	}
	return {
		...mapWorkSessionRow(row),
		projectName: project.name,
	};
}

/**
 * Fetches the signed-in user's currently active work session.
 *
 * RLS limits the query to the authenticated user's rows. The database also
 * guarantees that a user can have at most one session where ended_at is null.
 *
 * @returns The active session with project metadata, or null when none exists.
 */
export async function getActiveWorkSession(): Promise<ActiveWorkSession | null> {
	const supabase = await createClient();

	const {data, error} = await supabase
		.from("work_sessions")
		.select(`
			id,
			user_id,
			project_id,
			started_at,
			ended_at,
			projects!work_sessions_user_project_fkey (
				name
			)
		`)
		.is("ended_at", null)
		.maybeSingle();

	if (error || !data) {
		return null;
	}

	return mapActiveWorkSessionRow(data);
}

/**
 * Fetches all work sessions for one project, newest first.
 *
 * RLS ensures that only sessions attached to projects owned by the signed-in
 * user can be returned.
 *
 * @param projectId - The project whose tracked sessions should be loaded.
 * @returns The project's work sessions ordered from newest to oldest.
 */
export async function getWorkSessionsForProject(
	projectId: string,
): Promise<WorkSession[]> {
	const supabase = await createClient();

	const {data, error} = await supabase
		.from("work_sessions")
		.select(`
			id,
			user_id,
			project_id,
			started_at,
			ended_at
		`)
		.eq("project_id", projectId)
		.order("started_at", {ascending: false});

	if (error || !data) {
		return [];
	}

	return (data).map(mapWorkSessionRow);
}