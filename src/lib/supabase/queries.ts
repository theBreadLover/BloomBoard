import {createClient} from "@/lib/supabase/server";
import type {Project, ProjectNote, ProjectTask} from "@/types/project";

interface ProjectRow {
	id: string;
	name: string;
	description: string;
	status: Project["status"];
	github_repo_url: string | null;
	created_at: string;
}

interface ProjectTaskRow {
	id: string;
	project_id: string;
	title: string;
	is_done: boolean;
	created_at: string;
}

interface ProjectNoteRow {
	id: string;
	project_id: string;
	task_id: string | null;
	body: string;
	created_at: string;
}

/** Converts a database project row (snake_case) into the app's Project type (camelCase). */
function mapProjectRow(row: ProjectRow): Project {
	return {
		id: row.id,
		name: row.name,
		description: row.description,
		status: row.status,
		githubRepoUrl: row.github_repo_url,
		createdAt: row.created_at,
	};
}

/** Converts a database task row (snake_case) into the app's ProjectTask type (camelCase). */
function mapTaskRow(row: ProjectTaskRow): ProjectTask {
	return {
		id: row.id,
		projectId: row.project_id,
		title: row.title,
		isDone: row.is_done,
		createdAt: row.created_at,
	};
}

/** Converts a database note row (snake_case) into the app's ProjectNote type (camelCase). */
function mapNoteRow(row: ProjectNoteRow): ProjectNote {
	return {
		id: row.id,
		projectId: row.project_id,
		taskId: row.task_id,
		body: row.body,
		createdAt: row.created_at,
	};
}

/**
 * Fetches every project belonging to the signed-in user, newest first.
 * Row Level Security on the `projects` table means this can never return
 * another user's projects, even if called with the wrong id by mistake.
 * @returns The user's projects, or an empty array if none exist or on error.
 */
export async function getProjects(): Promise<Project[]> {
	const supabase = await createClient();
	const {data, error} = await supabase.from("projects").select("*").order("created_at", {ascending: false});

	if (error || !data) return [];
	return data.map(mapProjectRow);
}

/**
 * Fetches a single project by id.
 * @param projectId - The project to look up.
 * @returns The project, or null if it doesn't exist or isn't yours.
 */
export async function getProjectById(projectId: string): Promise<Project | null> {
	const supabase = await createClient();
	const {data, error} = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();

	if (error || !data) return null;
	return mapProjectRow(data);
}

/**
 * Fetches every todo task across a set of projects, oldest first.
 * @param projectIds - The projects to fetch tasks for.
 * @returns The matching tasks, or an empty array if there are none or on error.
 */
export async function getTasksForProjects(projectIds: string[]): Promise<ProjectTask[]> {
	if (projectIds.length === 0) return [];

	const supabase = await createClient();
	const {data, error} = await supabase
		.from("project_tasks")
		.select("*")
		.in("project_id", projectIds)
		.order("created_at", {ascending: true});

	if (error || !data) return [];
	return data.map(mapTaskRow);
}

/**
 * Fetches every note for a single project, newest first.
 * @param projectId - The project to fetch notes for.
 * @returns The matching notes, or an empty array if there are none or on error.
 */
export async function getNotesForProject(projectId: string): Promise<ProjectNote[]> {
	const supabase = await createClient();
	const {data, error} = await supabase
		.from("project_notes")
		.select("*")
		.eq("project_id", projectId)
		.order("created_at", {ascending: false});

	if (error || !data) return [];
	return data.map(mapNoteRow);
}