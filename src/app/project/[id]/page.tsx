import {notFound} from "next/navigation";
import {findProjectById, getNotesForProject, getTasksForProject, mockNotes, mockTasks} from "@/lib/mockData";
import ProjectDetailView from "@/components/ProjectDetailView";

interface ProjectDetailPageProps {
	params: Promise<{ id: string }>;
}

/**
 * The project detail route: loads the project and its related tasks/notes
 * server-side, then hands them to the interactive client view.
 */
export default async function ProjectDetailPage({params}: ProjectDetailPageProps) {
	const {id} = await params;
	const project = findProjectById(id);

	if (!project) {
		notFound();
	}

	const projectTasks = getTasksForProject(project.id, mockTasks);
	const projectNotes = getNotesForProject(project.id, mockNotes);

	return <ProjectDetailView project={project}
	                          initialTasks={projectTasks}
	                          initialNotes={projectNotes}/>;
}