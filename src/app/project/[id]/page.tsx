import Link from "next/link";
import {notFound} from "next/navigation";
import {findProjectById} from "@/lib/mockData";
import StatusBadge from "@/components/StatusBadge";

interface ProjectDetailPageProps {
	// Next.js 15 delivers route params as a Promise, not a plain object — it
	// must be awaited before reading any property off it (see README).
	params: Promise<{ id: string }>;
}

/**
 * Stub detail page reached by clicking a project card. The real todo list,
 * notes timeline, and work timer get built here in the next step.
 */
export default async function ProjectDetailPage({params}: ProjectDetailPageProps): Promise<JSX.Element> {
	const {id} = await params;
	const project = findProjectById(id);

	if (!project) {
		notFound();
	}

	return (
		<div className="mx-auto max-w-2xl p-4 sm:p-6">
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
			</div>
			<p className="mt-8 rounded-xl border border-dashed border-brandBorder bg-brandSurface p-6 text-center text-sm text-brandTextFaint">
				The todo list, notes timeline, and work timer land here in the next build step.
			</p>
		</div>
	);
}