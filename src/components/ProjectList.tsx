"use client";

import {useMemo, useState} from "react";
import type {Project, ProjectStatus, ProjectTask} from "@/types/project";
import {computeProjectProgress} from "@/lib/mockData";
import ProjectCard from "./ProjectCard";

interface ProjectListProps {
	projects: Project[];
	tasks: ProjectTask[];
}

type StatusFilter = ProjectStatus | "all";

const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
	{value: "all", label: "All"},
	{value: "working", label: "Working"},
	{value: "postponed", label: "Postponed"},
	{value: "finished", label: "Finished"},
];

/**
 * The main screen: a filterable list of all projects as clickable cards.
 * A client component because it holds interactive filter state; the
 * projects/tasks themselves are fetched server-side by the parent page.
 */
export default function ProjectList({projects, tasks}: ProjectListProps): JSX.Element {
	const [activeFilter, setActiveFilter] = useState<StatusFilter>("all");

	// Only recompute the filtered list when the projects or the active filter change.
	const filteredProjects = useMemo(() => {
		if (activeFilter === "all") return projects;
		return projects.filter((project) => project.status === activeFilter);
	}, [projects, activeFilter]);

	return (
		<div className="mx-auto max-w-2xl p-4 sm:p-6">
			<header className="mb-5 flex items-center justify-between">
				<h1 className="font-heading text-xl font-bold text-brandText">My Projects</h1>
				<button
					type="button"
					className="rounded-xl bg-brandAccent px-4 py-2 font-heading text-sm font-semibold text-brandAccentContrast transition hover:brightness-110"
				>
					+ New
				</button>
			</header>

			<div className="mb-4 flex flex-wrap gap-2">
				{FILTER_OPTIONS.map((option) => (
					<button
						key={option.value}
						type="button"
						onClick={() => setActiveFilter(option.value)}
						className={`rounded-full px-3 py-1 font-heading text-sm font-medium transition ${
							activeFilter === option.value
								? "bg-brandAccentDark text-brandAccentContrast"
								: "border border-brandBorder bg-brandSurface text-brandTextMuted hover:bg-brandAccentLight"
						}`}
					>
						{option.label}
					</button>
				))}
			</div>

			<div className="flex flex-col gap-3">
				{filteredProjects.map((project) => (
					<ProjectCard
						key={project.id}
						project={project}
						completionPercentage={computeProjectProgress(project.id, tasks)}
					/>
				))}
				{filteredProjects.length === 0 && (
					<p className="py-10 text-center text-sm text-brandTextFaint">No projects with this status yet.</p>
				)}
			</div>
		</div>
	);
}