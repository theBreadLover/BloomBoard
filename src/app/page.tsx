import ProjectList from "@/components/ProjectList";
import { mockProjects, mockTasks } from "@/lib/mockData";

export default function HomePage() {
  return <ProjectList projects={mockProjects} tasks={mockTasks} />;
}
