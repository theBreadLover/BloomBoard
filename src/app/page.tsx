import ProjectList from "@/components/ProjectList";
import { mockProjects, mockTasks } from "@/lib/mockData";

/**
 * The home page: a server component that loads project data and hands it to
 * the client-side filterable list. Data fetching moves to Supabase in a later step.
 */
export default function HomePage() {
  return <ProjectList projects={mockProjects} tasks={mockTasks} />;
}
