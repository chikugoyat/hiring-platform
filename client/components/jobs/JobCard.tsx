import { Job } from "@/utils/db";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function JobCard({
  job,
  editNode,
  onArchiveToggle,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  job: Job;
  editNode?: React.ReactNode;
  onArchiveToggle: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}) {
  return (
    <div
      className="rounded-lg border bg-card p-4 flex items-center gap-4"
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="cursor-grab select-none text-xl" title="Drag to reorder">⋮⋮</div>
      <div className="flex-1">
        <Link to={`/jobs/${job.id}`} className="font-semibold hover:underline">
          {job.title}
        </Link>
        <div className="text-xs text-muted-foreground">/{job.slug}</div>
        <div className="mt-1 flex flex-wrap gap-2">
          {job.tags?.map((t) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-accent">
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="text-xs px-2 py-1 rounded bg-muted capitalize">{job.status}</div>
      {editNode}
      <Button variant="outline" onClick={onArchiveToggle}>
        {job.status === "archived" ? "Unarchive" : "Archive"}
      </Button>
    </div>
  );
}
