import ProjectList from "@/components/ProjectList";
import { getProjects, getTasksForProjects } from "@/lib/supabase/queries";

/**
 * The home page that loads the signed-in user's real
 * projects (and their tasks, for the progress bars) from Supabase, then
 * hands them to the client-side filterable list.
 */
export default async function HomePage() {
  const projects = await getProjects();
  const tasks = await getTasksForProjects(projects.map((project) => project.id));

  return <ProjectList projects={projects} tasks={tasks} />;
}