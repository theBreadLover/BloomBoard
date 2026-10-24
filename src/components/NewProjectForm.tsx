"use client";

import {useState} from "react";
import {createProject} from "@/app/actions";

/**
 * The "+ New" control on the project list: a plain button that expands into
 * an inline create-project form, submitting straight to the `createProject`
 * Server Action.
 */
export default function NewProjectForm() {
	const [isOpen, setIsOpen] = useState(false);

	if (!isOpen) {
		return (
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className="rounded-xl bg-brandAccent px-4 py-2 font-heading text-sm font-semibold text-brandAccentContrast transition hover:brightness-110"
			>
				+ New
			</button>
		);
	}

	return (
		<form
			action={async (formData) => {
				await createProject(formData);
				setIsOpen(false);
			}}
			className="mb-4 flex flex-col gap-2 rounded-2xl border border-dashed border-brandBorder bg-brandSurface p-3"
		>
			<input
				type="text"
				name="name"
				required
				autoFocus
				placeholder="Project name"
				className="rounded-lg bg-brandBg px-3 py-2 text-sm text-brandText placeholder:text-brandTextFaint focus:outline-none"
			/>
			<input
				type="text"
				name="description"
				placeholder="Short description (optional)"
				className="rounded-lg bg-brandBg px-3 py-2 text-sm text-brandText placeholder:text-brandTextFaint focus:outline-none"
			/>
			<div className="flex gap-2">
				<button
					type="submit"
					className="rounded-lg bg-brandAccent px-3 py-1.5 font-heading text-xs font-bold text-brandAccentContrast"
				>
					Create
				</button>
				<button
					type="button"
					onClick={() => setIsOpen(false)}
					className="rounded-lg border border-brandBorder px-3 py-1.5 font-heading text-xs font-bold text-brandTextMuted"
				>
					Cancel
				</button>
			</div>
		</form>
	);
}