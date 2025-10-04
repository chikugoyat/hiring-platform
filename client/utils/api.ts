import { Job, JobStatus } from "@/utils/db";

export interface JobsQuery {
  search?: string;
  status?: JobStatus | "";
  page?: number;
  pageSize?: number;
  sort?: "order" | "-createdAt";
}

export async function apiGetJobs(q: JobsQuery) {
  const params = new URLSearchParams();
  if (q.search) params.set("search", q.search);
  if (q.status) params.set("status", q.status);
  if (q.page) params.set("page", String(q.page));
  if (q.pageSize) params.set("pageSize", String(q.pageSize));
  if (q.sort) params.set("sort", q.sort);
  const r = await fetch(`/api/jobs?${params.toString()}`);
  if (!r.ok) throw new Error(await r.text());
  return (await r.json()) as { items: Job[]; total: number; page: number; pageSize: number };
}

export async function apiCreateJob(input: Partial<Job>) {
  const r = await fetch(`/api/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!r.ok) throw new Error((await r.json()).message || "Failed to create job");
  return (await r.json()) as Job;
}

export async function apiUpdateJob(id: string, input: Partial<Job>) {
  const r = await fetch(`/api/jobs/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!r.ok) throw new Error((await r.json()).message || "Failed to update job");
  return (await r.json()) as Job;
}

export async function apiReorderJob(id: string, fromOrder: number, toOrder: number) {
  const r = await fetch(`/api/jobs/${id}/reorder`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fromOrder, toOrder }),
  });
  if (!r.ok) throw new Error((await r.json()).message || "Failed to reorder job");
  return (await r.json()) as { fromOrder: number; toOrder: number };
}
