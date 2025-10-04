import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { apiCreateJob, apiGetJobs, apiReorderJob, apiUpdateJob } from "@/utils/api";
import { Job, JobStatus } from "@/utils/db";
import { Button } from "@/components/ui/button";
import { JobModal } from "@/components/jobs/JobModal";
import { JobCard } from "@/components/jobs/JobCard";

const PAGE_SIZE = 10;

export default function JobsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<JobStatus | "">("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<"order" | "-createdAt">("order");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["jobs", { search, status, page, sort }],
    queryFn: () => apiGetJobs({ search, status, page, pageSize: PAGE_SIZE, sort }),
    keepPreviousData: true,
  });

  const createMut = useMutation({
    mutationFn: (input: Partial<Job>) => apiCreateJob(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<Job> }) => apiUpdateJob(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  });

  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [optimistic, setOptimistic] = useState<Job[]>([]);
  const list = data?.items || [];
  const items = optimistic.length ? optimistic : list;

  useEffect(() => {
    setOptimistic([]);
  }, [data?.page, data?.pageSize, data?.total, search, status, sort]);

  const totalPages = useMemo(() => (data ? Math.ceil(data.total / data.pageSize) : 1), [data]);

  function handleDragStart(i: number) {
    setDragIdx(i);
  }
  function handleDragOver(e: React.DragEvent, overIndex: number) {
    e.preventDefault();
    if (dragIdx === null || dragIdx === overIndex) return;
    const newItems = [...items];
    const [moved] = newItems.splice(dragIdx, 1);
    newItems.splice(overIndex, 0, moved);
    setOptimistic(newItems);
    setDragIdx(overIndex);
  }

  async function handleDrop(_e: React.DragEvent, dropIndex: number) {
    if (dragIdx === null || !data) return;
    const moved = items[dropIndex];
    const fromOrder = moved.order; // absolute
    const toOrder = (page - 1) * PAGE_SIZE + dropIndex; // absolute
    try {
      await apiReorderJob(moved.id, fromOrder, toOrder);
      await qc.invalidateQueries({ queryKey: ["jobs"] });
    } catch (e) {
      // rollback
      setOptimistic([]);
    } finally {
      setDragIdx(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3 flex-wrap">
        <div>
          <label className="block text-sm mb-1">Search</label>
          <input
            className="border rounded-md px-3 py-2 w-64"
            placeholder="Title or slug"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Status</label>
          <select
            className="border rounded-md px-3 py-2"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as JobStatus | "");
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="upcoming">Upcoming</option>
            <option value="archived">Archived</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Sort</label>
          <select className="border rounded-md px-3 py-2" value={sort} onChange={(e) => setSort(e.target.value as any)}>
            <option value="order">Manual Order</option>
            <option value="-createdAt">Newest</option>
          </select>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <JobModal
            trigger={<Button>Create Job</Button>}
            onSave={async (input) => {
              await createMut.mutateAsync(input);
              setPage(1);
            }}
          />
        </div>
      </div>

      {isLoading ? <div>Loading...</div> : null}
      {isError ? <div className="text-red-600">{(error as any)?.message || "Error"}</div> : null}

      <div className="space-y-3">
        {items.map((job, i) => (
          <JobRow
            key={job.id}
            job={job}
            onArchiveToggle={() =>
              updateMut.mutate(
                { id: job.id, input: { status: job.status === "archived" ? "active" : "archived" } },
                { onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }) },
              )
            }
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={(e) => handleDrop(e, i)}
            renderEdit={(node) => node}
          />
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="text-sm text-muted-foreground">Page {data?.page} of {totalPages}</div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </Button>
          <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function JobRow({
  job,
  onArchiveToggle,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  job: Job;
  onArchiveToggle: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  return (
    <JobCard
      job={job}
      editNode={
        <JobModal
          trigger={<Button variant="ghost">Edit</Button>}
          initial={job}
          onSave={async (input) => {
            await apiUpdateJob(job.id, input);
          }}
        />
      }
      onArchiveToggle={onArchiveToggle}
      draggable
      onDragStart={(_e) => onDragStart()}
      onDragOver={onDragOver}
      onDrop={onDrop}
    />
  );
}
