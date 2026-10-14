import { notFound } from "next/navigation";
import { getNotesForProject, getProjectById, getTasksForProjects } from "@/lib/supabase/queries";
import ProjectDetailView from "@/components/ProjectDetailView";

interface ProjectDetailPageProps {
	params: Promise<{ id: string }>;
}

/**
 * The project detail route: loads the project and its real tasks/notes from
 * Supabase, then hands them to the interactive client view.
 */
export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
	const { id } = await params;
	const project = await getProjectById(id);

	if (!project) {
		notFound();
	}

	const [tasks, notes] = await Promise.all([getTasksForProjects([project.id]), getNotesForProject(project.id)]);

	return <ProjectDetailView project={project} tasks={tasks} notes={notes} />;
}