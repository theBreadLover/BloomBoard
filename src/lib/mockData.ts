import type {Project, ProjectNote, ProjectTask} from "@/types/project";

/**
 * Placeholder sample data so the UI can be previewed before the Supabase
 * backend is wired up.
 * TODO Replace with real data-fetching in a later step.
 */
export const mockProjects: Project[] = [
	{
		id: "proj-1",
		name: "BloomBoard",
		description: "This very app — a place to track all my side projects.",
		status: "working",
		githubRepoUrl: "https://github.com/example/project-tracker",
		createdAt: "2026-10-01T09:00:00.000Z",
	},
	{
		id: "proj-2",
		name: "Home Budget Spreadsheet Automation",
		description: "A script that imports bank CSVs into a monthly budget sheet.",
		status: "postponed",
		githubRepoUrl: null,
		createdAt: "2026-08-15T09:00:00.000Z",
	},
	{
		id: "proj-3",
		name: "Portfolio Website",
		description: "Static site showcasing past projects.",
		status: "finished",
		githubRepoUrl: "https://github.com/example/portfolio-site",
		createdAt: "2026-05-02T09:00:00.000Z",
	},
];

export const mockTasks: ProjectTask[] = [
	{id: "task-1", projectId: "proj-1", title: "Design data model", isDone: true, createdAt: "2026-10-01T10:00:00.000Z"},
	{id: "task-2", projectId: "proj-1", title: "Build project list screen", isDone: true, createdAt: "2026-10-02T10:00:00.000Z"},
	{id: "task-3", projectId: "proj-1", title: "Build project detail screen", isDone: false, createdAt: "2026-10-03T10:00:00.000Z"},
	{id: "task-4", projectId: "proj-1", title: "Wire up Supabase backend", isDone: false, createdAt: "2026-10-03T10:05:00.000Z"},
];

export const mockNotes: ProjectNote[] = [
	{
		id: "note-1",
		projectId: "proj-1",
		taskId: "task-2",
		body: "Used a card layout with a status-colored left border — looks clean on mobile too.",
		createdAt: "2026-10-02T15:30:00.000Z",
	},
	{
		id: "note-2",
		projectId: "proj-1",
		taskId: "task-3",
		body: "Decided on a tabbed layout for Todos / Notes / Source Code instead of a split view — feels cleaner on mobile.",
		createdAt: "2026-10-11T08:30:00.000Z",
	},
];

/**
 * Computes the completion percentage of a project's todo list.
 * @param projectId - The project to compute progress for.
 * @param tasks - All tasks across all projects.
 * @returns A percentage between 0 and 100, or 0 if the project has no tasks.
 */
export function computeProjectProgress(projectId: string, tasks: ProjectTask[]): number {
	const projectTasks = tasks.filter((task) => task.projectId === projectId);
	if (projectTasks.length === 0) {
		return 0;
	}
	const doneCount = projectTasks.filter((task) => task.isDone).length;
	return Math.round((doneCount / projectTasks.length) * 100);
}

/**
 * Looks up a single project by id, used by the detail page.
 * @param projectId - The id of the project to find.
 * @returns The matching project, or undefined if no project has that id.
 */
export function findProjectById(projectId: string): Project | undefined {
	return mockProjects.find((project) => project.id === projectId);
}

/**
 * Returns every todo task that belongs to a given project, oldest first.
 * @param projectId - The project to filter tasks for.
 * @param tasks - All tasks across all projects.
 * @returns Just that project's tasks, in creation order.
 */
export function getTasksForProject(projectId: string, tasks: ProjectTask[]): ProjectTask[] {
	return tasks
		.filter((task) => task.projectId === projectId)
		.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

/**
 * Returns every note that belongs to a given project, most recent first.
 * @param projectId - The project to filter notes for.
 * @param notes - All notes across all projects.
 * @returns Just that project's notes, newest first.
 */
export function getNotesForProject(projectId: string, notes: ProjectNote[]): ProjectNote[] {
	return notes
		.filter((note) => note.projectId === projectId)
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}