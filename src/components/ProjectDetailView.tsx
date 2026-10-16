"use client";

import Link from "next/link";
import {useRouter} from "next/navigation";
import {useEffect, useRef, useState, useTransition} from "react";
import type {Project, ProjectNote, ProjectStatus, ProjectTask} from "@/types/project";
import {PROJECT_STATUS_META} from "@/types/project";
import {createNote, createTask, toggleTask as toggleTaskAction, updateProjectStatus} from "@/app/actions";
import {formatClockTime, formatDuration, groupNotesByDay} from "@/lib/dateUtils";
import StatusBadge from "./StatusBadge";

// The order statuses appear in the status switcher.
const STATUS_OPTIONS: ProjectStatus[] = ["working", "postponed", "finished", "abandoned"];

interface ProjectDetailViewProps {
	project: Project;
	tasks: ProjectTask[];
	notes: ProjectNote[];
}

type DetailTab = "todos" | "notes" | "code";

/**
 * The real project detail screen: a status header, and tabs for the todo
 * list, the day-grouped notes timeline, and (eventually) the GitHub source
 * browser. Also hosts the work session timer.
 *
 * Every change here (status, todos, notes) calls a Supabase-backed Server
 * Action and then refreshes the route, so `project`/`tasks`/`notes` are
 * always the source of truth from the database — there's no local copy to
 * drift out of sync. The work timer is still local-only; it gets wired to
 * real work-session logging in a later step.
 */
export default function ProjectDetailView({project, tasks, notes}: ProjectDetailViewProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [activeTab, setActiveTab] = useState<DetailTab>("todos");
	const [newTodoText, setNewTodoText] = useState("");
	const [newNoteText, setNewNoteText] = useState("");
	// Empty string means "no specific todo" — kept as a string since <select> values are always strings.
	const [newNoteTaskId, setNewNoteTaskId] = useState("");
	const [isTimerRunning, setIsTimerRunning] = useState(false);
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	// Tick the running timer once a second while it's active, and clean up on unmount.
	useEffect(() => {
		if (isTimerRunning) {
			timerIntervalRef.current = setInterval(() => {
				setElapsedSeconds((previous) => previous + 1);
			}, 1000);
		}
		return () => {
			if (timerIntervalRef.current) {
				clearInterval(timerIntervalRef.current);
			}
		};
	}, [isTimerRunning]);

	const doneTaskCount = tasks.filter((task) => task.isDone).length;
	const completionPercentage = tasks.length === 0 ? 0 : Math.round((doneTaskCount / tasks.length) * 100);
	const noteDayGroups = groupNotesByDay(notes);

	/** Persists a new status for this project, then refreshes the page's data. */
	function handleStatusChange(status: ProjectStatus): void {
		startTransition(async () => {
			await updateProjectStatus(project.id, status);
			router.refresh();
		});
	}

	/** Flips a task between done and not-done, then refreshes the page's data. */
	function handleToggleTask(task: ProjectTask): void {
		startTransition(async () => {
			await toggleTaskAction(task.id, project.id, !task.isDone);
			router.refresh();
		});
	}

	/** Saves a new todo from the input box, ignoring empty submissions. */
	function handleAddTask(): void {
		const title = newTodoText.trim();
		if (!title) return;
		setNewTodoText("");
		startTransition(async () => {
			await createTask(project.id, title);
			router.refresh();
		});
	}

	/** Saves a new note (optionally tagged to a todo), ignoring empty submissions. */
	function handleAddNote(): void {
		const body = newNoteText.trim();
		if (!body) return;
		setNewNoteText("");
		startTransition(async () => {
			await createNote(project.id, newNoteTaskId || null, body);
			router.refresh();
		});
	}

	/** Starts or stops the work session timer (not yet persisted — see component doc comment). */
	function toggleTimer(): void {
		setIsTimerRunning((previous) => !previous);
	}

	return (
		<div className="mx-auto max-w-2xl p-4 pb-32 sm:p-6">
			<Link href="/"
			      className="text-sm text-brandTextMuted hover:underline">
				&larr; Back to all projects
			</Link>

			<div className="mt-3 rounded-2xl border border-brandBorder bg-brandSurface p-5">
				<div className="flex items-start justify-between gap-3">
					<div>
						<h1 className="font-heading text-xl font-bold text-brandText">{project.name}</h1>
						<p className="mt-1 text-sm text-brandTextMuted">{project.description}</p>
					</div>
					<StatusBadge status={project.status}/>
				</div>

				<div className="mt-4 flex flex-wrap gap-2">
					{STATUS_OPTIONS.map((statusOption) => {
						const statusMeta = PROJECT_STATUS_META[statusOption];
						const isActive = project.status === statusOption;
						return (
							<button
								key={statusOption}
								type="button"
								disabled={isPending}
								onClick={() => handleStatusChange(statusOption)}
								className={`rounded-full px-3 py-1 font-heading text-xs font-semibold transition disabled:opacity-60 ${
									isActive
										? statusMeta.badgeClassName
										: "border border-brandBorder bg-brandBg text-brandTextMuted hover:bg-brandAccentLight"
								}`}
							>
								{statusMeta.label}
							</button>
						);
					})}
				</div>

				<div className="mt-4 flex flex-wrap gap-2">
					{project.githubRepoUrl && (
						<a
							href={project.githubRepoUrl}
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-center gap-1.5 rounded-lg border border-brandBorder bg-brandBg px-3 py-1.5 font-heading text-xs font-semibold text-brandText hover:bg-brandAccentLight"
						>
							🔗 {project.githubRepoUrl.replace("https://", "")}
						</a>
					)}
					<span className="inline-flex items-center gap-1.5 rounded-lg border border-brandBorder bg-brandBg px-3 py-1.5 text-xs font-semibold text-brandText">
            <strong className="text-brandAccent">{completionPercentage}%</strong>&nbsp;of todos done
          </span>
				</div>
			</div>

			<div className="mt-4 flex rounded-xl border border-brandBorder bg-brandSurface p-1">
				<button
					type="button"
					onClick={() => setActiveTab("todos")}
					className={`project-tab ${
						activeTab === "todos" ? "bg-brandAccent text-brandAccentContrast" : "text-brandTextMuted"
					}`}
				>
					Todos
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("notes")}
					className={`project-tab ${
						activeTab === "notes" ? "bg-brandAccent text-brandAccentContrast" : "text-brandTextMuted"
					}`}
				>
					Notes &amp; Activity
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("code")}
					className={`project-tab ${
						activeTab === "code" ? "bg-brandAccent text-brandAccentContrast" : "text-brandTextMuted"
					}`}
				>
					Source Code
				</button>
			</div>

			{activeTab === "todos" && (
				<div className="mt-4 rounded-2xl border border-brandBorder bg-brandSurface p-2">
					{tasks.length === 0 && (
						<p className="px-3 py-6 text-center text-sm text-brandTextFaint">No todos yet — add your first one below.</p>
					)}
					{tasks.map((task) => (
						<div key={task.id}
						     className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-brandBg">
							<button
								type="button"
								disabled={isPending}
								onClick={() => handleToggleTask(task)}
								aria-label={task.isDone ? "Mark as not done" : "Mark as done"}
								className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-xs font-bold disabled:opacity-60 ${
									task.isDone
										? "border-brandAccent bg-brandAccent text-brandAccentContrast"
										: "border-brandBorder text-transparent"
								}`}
							>
								✓
							</button>
							<span className={`text-sm ${task.isDone ? "text-brandTextFaint line-through" : "text-brandText"}`}>
                {task.title}
              </span>
						</div>
					))}
					<div className="mt-1 flex gap-2 border-t border-dashed border-brandBorder px-3 pt-3">
						<input
							type="text"
							value={newTodoText}
							onChange={(event) => setNewTodoText(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter") handleAddTask();
							}}
							placeholder="Add a todo…"
							className="flex-1 bg-transparent text-sm text-brandText placeholder:text-brandTextFaint focus:outline-none"
						/>
						<button
							type="button"
							disabled={isPending}
							onClick={handleAddTask}
							className="rounded-lg bg-brandAccentLight px-3 py-1 font-heading text-xs font-bold text-brandAccent disabled:opacity-60"
						>
							Add
						</button>
					</div>
				</div>
			)}

			{activeTab === "notes" && (
				<div className="mt-4">
					{noteDayGroups.length === 0 && (
						<p className="rounded-2xl border border-brandBorder bg-brandSurface px-3 py-6 text-center text-sm text-brandTextFaint">
							No notes yet — jot down what you're working on below.
						</p>
					)}
					{noteDayGroups.map((group) => (
						<div key={group.dayLabel}
						     className="mb-4">
							<p className="mb-2 ml-1 font-heading text-xs font-extrabold uppercase tracking-wide text-brandTextFaint">
								{group.dayLabel}
							</p>
							{group.notes.map((note) => (
								<div key={note.id}
								     className="mb-2 rounded-xl border border-brandBorder bg-brandSurface p-3">
									<div className="mb-1.5 flex items-center justify-between">
										<span className="text-xs font-semibold text-brandTextFaint">{formatClockTime(note.createdAt)}</span>
										{note.taskId && (
											<span className="rounded-full bg-brandAccentLight px-2 py-0.5 font-heading text-xs font-bold text-brandAccent">
                        {tasks.find((task) => task.id === note.taskId)?.title ?? "Linked todo"}
                      </span>
										)}
									</div>
									<p className="text-sm text-brandText">{note.body}</p>
								</div>
							))}
						</div>
					))}
					<div className="flex flex-col gap-2 rounded-xl border border-dashed border-brandBorder bg-brandSurface p-3">
						<select
							value={newNoteTaskId}
							onChange={(event) => setNewNoteTaskId(event.target.value)}
							aria-label="Tag this note to a todo (optional)"
							className="self-start rounded-full bg-brandAccentLight px-2.5 py-1 font-heading text-xs font-bold text-brandAccent focus:outline-none"
						>
							<option value="">No specific todo</option>
							{tasks.map((task) => (
								<option key={task.id}
								        value={task.id}>
									{task.title}
								</option>
							))}
						</select>
						<div className="flex gap-2">
							<input
								type="text"
								value={newNoteText}
								onChange={(event) => setNewNoteText(event.target.value)}
								onKeyDown={(event) => {
									if (event.key === "Enter") handleAddNote();
								}}
								placeholder="Add a note about what you're working on…"
								className="flex-1 bg-transparent text-sm text-brandText placeholder:text-brandTextFaint focus:outline-none"
							/>
							<button
								type="button"
								disabled={isPending}
								onClick={handleAddNote}
								className="rounded-lg bg-brandAccent px-3 py-1 font-heading text-xs font-bold text-brandAccentContrast disabled:opacity-60"
							>
								Save
							</button>
						</div>
					</div>
				</div>
			)}

			{activeTab === "code" && (
				<div className="mt-4 rounded-2xl border border-brandBorder bg-brandSurface p-4">
					<p className="text-sm text-brandTextMuted">
						Read-only file browser for the linked GitHub repo — built in a later step.
					</p>
				</div>
			)}

			<button
				type="button"
				onClick={toggleTimer}
				className="fixed bottom-6 right-5 flex items-center gap-2 rounded-full bg-brandAccentDark px-5 py-3.5 font-heading text-sm font-bold text-brandAccentContrast shadow-lg"
			>
				<span className={`h-2 w-2 rounded-full bg-red-400 ${isTimerRunning ? "animate-pulse" : ""}`}/>
				{isTimerRunning ? `Stop timer (${formatDuration(elapsedSeconds)})` : "Start timer"}
			</button>
		</div>
	);
}