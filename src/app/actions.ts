"use server";

import {revalidatePath} from "next/cache";
import {createClient} from "@/lib/supabase/server";
import type {
	ProjectStatus,
	StartWorkSessionResult,
	WorkSession,
} from "@/types/project";

interface StartWorkSessionRpcRow {
	status: "success" | "already_active" | "not_found" | "unauthorized";
	session_id: string | null;
	user_id: string | null;
	project_id: string | null;
	started_at: string | null;
	ended_at: string | null;
	active_project_id: string | null;
}

interface RpcError {
	code?: string;
	message: string;
}

function mapSuccessfulWorkSession(row: StartWorkSessionRpcRow): WorkSession  |null {
	if (
		row.session_id === null ||
		row.user_id === null ||
		row.project_id === null ||
		row.started_at === null
	) {
		return null;
	}

	return  {
		id: row.session_id,
		userId: row.user_id,
		projectId: row.project_id,
		startedAt: row.started_at,
		endedAt: row.ended_at,
	}
}

function isRpcPermisionDenied(error: RpcError): boolean {
	return error.code === "42501";
}

/**
 * Creates a new project for the signed-in user from a submitted form
 * (expects "name" and optionally "description" fields), then refreshes the home page.
 * @param formData - The submitted new-project form.
 */
export async function createProject(formData: FormData): Promise<void> {
	const name = String(formData.get("name") ?? "").trim();
	const description = String(formData.get("description") ?? "").trim();
	if (!name) return;

	const supabase = await createClient();
	const {
		data: {user},
	} = await supabase.auth.getUser();
	if (!user) return;

	await supabase.from("projects").insert({
		user_id: user.id,
		name,
		description,
		status: "working",
	});

	revalidatePath("/");
}

/**
 * Updates a project's status, then refreshes both the home list and its detail page.
 * @param projectId - The project to update.
 * @param status - The new status to set.
 */
export async function updateProjectStatus(projectId: string, status: ProjectStatus): Promise<void> {
	const supabase = await createClient();
	await supabase.from("projects").update({status}).eq("id", projectId);

	revalidatePath("/");
	revalidatePath(`/project/${projectId}`);
}

/**
 * Adds a new todo task to a project, then refreshes its detail page.
 * @param projectId - The project the task belongs to.
 * @param title - The todo's text.
 */
export async function createTask(projectId: string, title: string): Promise<void> {
	const trimmedTitle = title.trim();
	if (!trimmedTitle) return;

	const supabase = await createClient();
	await supabase.from("project_tasks").insert({project_id: projectId, title: trimmedTitle});

	revalidatePath("/");
	revalidatePath(`/project/${projectId}`);
}

/**
 * Flips a task's done/not-done state, then refreshes its project's detail page.
 * @param taskId - The task to update.
 * @param projectId - The project it belongs to (used to refresh the right page).
 * @param isDone - The new done state to set.
 */
export async function toggleTask(taskId: string, projectId: string, isDone: boolean): Promise<void> {
	const supabase = await createClient();
	await supabase.from("project_tasks").update({is_done: isDone}).eq("id", taskId);

	revalidatePath("/");
	revalidatePath(`/project/${projectId}`);
}

/**
 * Adds a new note to a project, optionally tagged to a specific todo task,
 * then refreshes that project's detail page.
 * @param projectId - The project the note belongs to.
 * @param taskId - The todo task to tag this note to, or null for no tag.
 * @param body - The note's text.
 */
export async function createNote(projectId: string, taskId: string | null, body: string): Promise<void> {
	const trimmedBody = body.trim();
	if (!trimmedBody) return;

	const supabase = await createClient();
	await supabase.from("project_notes").insert({project_id: projectId, task_id: taskId, body: trimmedBody});

	revalidatePath(`/project/${projectId}`);
}

/**
 * Starts a persisted work session for an owned project.
 *
 * PostgreSQL owns authentication, project authorization, concurrency, and the authoritative start timestamp.
 * This action translate the database command result into BloomBoard's typed application contract.
 *
 * @param projectId - The project the user wants to start working on.
 * @returns The resulting work-session state.
 */
export async function startWorkSession(projectId: string): Promise<StartWorkSessionResult> {
	const supabase = await createClient();

	const {data, error} = await supabase.rpc(
		"start_work_session",
		{
			requested_project_id: projectId,
		},
	);

	if(error) {
		if(isRpcPermisionDenied(error)) {
			return {
				status: "unauthorized",
				message: "You must be signed in to start a work session.",
			}
		}

		return {
			status: "error",
			message: "Could not start the work session. Try again.",
		}
	}

	const row: StartWorkSessionRpcRow | undefined = data?.[0];

	if (!row) {
		return {
			status: "error",
			message: "Could not start the work session. Try again.",
		}
	}

	if (row.status === 'already_active') {
		if (row.active_project_id === null) {
			return {
				status: "error",
				message: "Could not start the work session. Try again.",
			}
		}

		return {
			status: "already-active",
			activeProjectId: row.active_project_id,
		}
	}

	if (row.status === "not_found") {
		return {
			status: "not-found",
			message: "The project could not be found.",
		}
	}

	if (row.status === "unauthorized") {
		return {
			status: "unauthorized",
			message: "You must be signed in to start a work session.",
		}
	}

	const session: WorkSession | null = mapSuccessfulWorkSession(row);

	if (!session) {
		return {
			status: "error",
			message: "Could not start the work session. Try again.",
		}
	}

	revalidatePath("/");
	revalidatePath(`/project/${session.projectId}`);

	return {
		status: "success",
		session,
	}
}