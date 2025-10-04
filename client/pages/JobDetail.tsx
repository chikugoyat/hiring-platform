import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Job } from "@/utils/db";

async function getJob(id: string) {
  const r = await fetch(`/api/jobs?search=&status=&page=1&pageSize=1000`);
  const data = await r.json();
  const job: Job | undefined = data.items.find((j: Job) => j.id === id);
  if (!job) throw new Error("Not found");
  return job;
}

export default function JobDetail() {
  const { jobId } = useParams();
  const { data, isLoading, isError } = useQuery({ queryKey: ["job", jobId], queryFn: () => getJob(jobId!) });
  const [applicants, setApplicants] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const r = await fetch(`/api/candidates?search=&stage=&page=1&pageSize=1000`);
      const json = await r.json();
      if (!mounted) return;
      const items = (json.items || []).filter((c:any)=>c.jobId === jobId);
      setApplicants(items);
    })();
    return () => { mounted = false; };
  }, [jobId]);

  if (isLoading) return <div>Loading...</div>;
  if (isError || !data) return <div>Job not found</div>;

  return (
    <div className="space-y-4">
      <div>
        <div className="text-2xl font-bold">{data.title}</div>
        <div className="text-sm text-muted-foreground">/{data.slug}</div>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <section className="rounded-lg border p-4">
            <div className="font-semibold mb-2">Description</div>
            <p className="text-sm leading-6 whitespace-pre-wrap">{data.description}</p>
          </section>
          <section className="rounded-lg border p-4">
            <div className="font-semibold mb-2">Requirements</div>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {data.requirements?.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </section>
        </div>
        <div className="space-y-4">
          <section className="rounded-lg border p-4">
            <div className="font-semibold mb-2">Overview</div>
            <div className="text-sm">Status: <span className="capitalize">{data.status}</span></div>
            {data.stipend ? <div className="text-sm">Stipend: {data.stipend}</div> : null}
            {data.deadline ? <div className="text-sm">Deadline: {new Date(data.deadline).toLocaleDateString()}</div> : null}
            {data.scope ? <div className="text-sm">Scope: {data.scope}</div> : null}
            <div className="mt-2 flex flex-wrap gap-2">
              {data.tags?.map((t) => (
                <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-accent">{t}</span>
              ))}
            </div>
          </section>
          <section className="rounded-lg border p-4">
            <div className="font-semibold mb-2">Assessments</div>
            <p className="text-sm text-muted-foreground">Builder and runtime will appear here.</p>
          </section>
        </div>
      </div>

      <section className="rounded-lg border p-4">
        <div className="font-semibold mb-2">Applicants ({applicants.length})</div>
        <div className="space-y-2">
          {applicants.map((a)=> (
            <div key={a.id} className="flex items-center justify-between border rounded px-3 py-2">
              <div>
                <a className="font-medium text-primary" href={`/candidates/${a.id}`}>{a.name}</a>
                <div className="text-xs text-muted-foreground">{a.email} • <span className="capitalize">{a.stage}</span></div>
              </div>
              <div className="text-sm text-muted-foreground">{a.experience} yrs • <a className="text-primary hover:underline" href={`/resume/${a.id}`}>Resume</a></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
