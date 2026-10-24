import type { ProjectStatus } from "@/types/project";
import { PROJECT_STATUS_META } from "@/types/project";

interface StatusBadgeProps {
  status: ProjectStatus;
}

/**
 * Renders a small color-coded pill showing a project's current status.
 */
export default function StatusBadge({ status }: StatusBadgeProps) {
  const meta = PROJECT_STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-heading text-xs font-semibold ${meta.badgeClassName}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClassName}`} />
      {meta.label}
    </span>
  );
}