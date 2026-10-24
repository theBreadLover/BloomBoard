import type {ProjectTask} from "@/types/project";

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