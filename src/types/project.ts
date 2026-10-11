/**
 * The lifecycle status of a project, shown as a color-coded badge in the UI.
 */
export type ProjectStatus = "working" | "postponed" | "finished";

/**
 * A single todo item that belongs to a project.
 */
export interface ProjectTask {
	id: string;
	projectId: string;
	title: string;
	isDone: boolean;
	createdAt: string; // ISO timestamp
}

/**
 * A free-text note taken while working on a project, optionally tied to a
 * specific task so notes can be grouped under "what I did on this todo".
 */
export interface ProjectNote {
	id: string;
	projectId: string;
	taskId: string | null;
	body: string;
	createdAt: string; // ISO timestamp
}

/**
 * A single timed work session on a project, used to measure daily work time
 * for the "haven't worked an hour today" notification.
 */
export interface WorkSession {
	id: string;
	projectId: string;
	startedAt: string; // ISO timestamp
	endedAt: string | null; // null while the timer is still running
}

/**
 * A tracked personal project, the top-level entity in the app.
 */
export interface Project {
	id: string;
	name: string;
	description: string;
	status: ProjectStatus;
	githubRepoUrl: string | null;
	createdAt: string; // ISO timestamp
}

/**
 * Display metadata for each status value: label text and the Tailwind color
 * classes used for its badge, status dot, and card left-border accent.
 * Colors come from the fixed semantic status tokens in tailwind.config.ts —
 * these do not change with the app's theme.
 */
export const PROJECT_STATUS_META: Record<
	ProjectStatus,
	{ label: string; badgeClassName: string; dotClassName: string; borderClassName: string }
> = {
	working: {
		label: "Working",
		badgeClassName: "bg-statusWorkingBg text-statusWorkingText",
		dotClassName: "bg-statusWorkingDot",
		borderClassName: "border-l-statusWorkingDot",
	},
	postponed: {
		label: "Postponed",
		badgeClassName: "bg-statusPostponedBg text-statusPostponedText",
		dotClassName: "bg-statusPostponedDot",
		borderClassName: "border-l-statusPostponedDot",
	},
	finished: {
		label: "Finished",
		badgeClassName: "bg-statusFinishedBg text-statusFinishedText",
		dotClassName: "bg-statusFinishedDot",
		borderClassName: "border-l-statusFinishedDot",
	},
};