"use server";

import {revalidatePath} from "next/cache";
import {createClient} from "@/lib/supabase/server";
import type {ProjectStatus} from "@/types/project";

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