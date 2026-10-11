import Link from "next/link";
import type {Project} from "@/types/project";
import {PROJECT_STATUS_META} from "@/types/project";
import StatusBadge from "./StatusBadge";

interface ProjectCardProps {
	project: Project;
	completionPercentage: number;
}

/**
 * Formats an ISO timestamp as a short relative string like "2 days ago".
 * @param isoTimestamp - The timestamp to format.
 * @returns A short human-readable relative time string.
 */
function formatRelativeTime(isoTimestamp: string): string {
	const millisecondsPerDay = 1000 * 60 * 60 * 24;
	const daysAgo = Math.floor((Date.now() - new Date(isoTimestamp).getTime()) / millisecondsPerDay);
	if (daysAgo <= 0) return "today";
	if (daysAgo === 1) return "yesterday";
	return `${daysAgo} days ago`;
}

/**
 * A single project card in the list view: name, status badge, progress ring,
 * and last-activity timestamp. Clicking it navigates to the project detail page.
 */
export default function ProjectCard({project, completionPercentage}: ProjectCardProps): JSX.Element {
	const statusMeta = PROJECT_STATUS_META[project.status];

	return (
		<Link
			href={`/project/${project.id}`}
			className={`block w-full rounded-2xl border border-brandBorder border-l-4 ${statusMeta.borderClassName} bg-brandSurface p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brandAccent`}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<h3 className="truncate font-heading text-base font-semibold text-brandText">{project.name}</h3>
					<p className="mt-1 line-clamp-2 text-sm text-brandTextMuted">{project.description}</p>
				</div>
				<div className="flex shrink-0 flex-col items-end gap-2">
					<StatusBadge status={project.status}/>
				</div>
			</div>
			<div className="mt-3 flex items-center justify-between gap-4">
				<div className="flex flex-1 items-center gap-2">
					<div className="h-1.5 flex-1 overflow-hidden rounded-full bg-brandBorder">
						<div
							className="h-full rounded-full bg-brandAccent"
							style={{width: `${completionPercentage}%`}}
						/>
					</div>
					<span className="whitespace-nowrap text-xs text-brandTextFaint">{completionPercentage}%</span>
				</div>
				<p className="whitespace-nowrap text-xs text-brandTextFaint">{formatRelativeTime(project.createdAt)}</p>
			</div>
		</Link>
	);
}