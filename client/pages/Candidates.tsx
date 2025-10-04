import { useEffect, useMemo, useState } from "react";

export default function CandidatesPage() {
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<any>(null);
  const [jobMap, setJobMap] = useState<Record<string,string>>({});
  const PAGE_SIZE = 50;

  useEffect(() => {
    let mounted = true;
    fetch(`/api/candidates?search=${encodeURIComponent(search)}&stage=${encodeURIComponent(stage)}&page=${page}&pageSize=${PAGE_SIZE}`)
      .then((r) => r.json())
      .then((json) => {
        if (mounted) setData(json);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [search, stage, page]);

  useEffect(() => {
    // fetch all jobs once to map jobId -> title
    let mounted = true;
    fetch(`/api/jobs?search=&status=&page=1&pageSize=1000`)
      .then((r) => r.json())
      .then((json) => {
        if (!mounted) return;
        const map: Record<string,string> = {};
        (json.items || []).forEach((j: any) => (map[j.id] = j.title));
        setJobMap(map);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const items = data?.items || [];

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-end">
        <div>
          <label className="block text-sm mb-1">Search</label>
          <input className="border rounded-md px-3 py-2 w-64" placeholder="Name or email" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div>
          <label className="block text-sm mb-1">Stage</label>
          <select className="border rounded-md px-3 py-2" value={stage} onChange={(e) => { setStage(e.target.value); setPage(1); }}>
            <option value="">All</option>
            <option value="applied">Applied</option>
            <option value="screen">Screen</option>
            <option value="tech">Tech</option>
            <option value="offer">Offer</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3">
        {items.map((c: any) => (
          <div key={c.id} className="border rounded-lg p-4 bg-card hover:shadow-lg transition-interactive">
            <div className="flex items-center gap-4">
              <img src={`https://i.pravatar.cc/48?u=${c.email}`} className="h-12 w-12 rounded-full" alt={c.name} />
              <div className="flex-1">
                <div>
                  <a className="font-semibold hover:scale-105 transition-interactive text-lg text-foreground" href={`/candidates/${c.id}`}>{c.name}</a>
                </div>
                <div className="text-sm text-muted-foreground">{c.email} • <span className="capitalize">{c.stage}</span></div>
                <div className="mt-2 text-sm">
                  Skills: {c.skills?.join(", ")}
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <a className="text-sm text-primary hover:underline" href={`/resume/${c.id}`}>Open Resume</a>
                <a className="text-sm text-primary hover:underline" href={c.resumeUrl} target="_blank" rel="noreferrer">External Resume</a>
                <div className="text-xs text-muted-foreground">Applied to <strong>{jobMap[c.jobId] || c.jobId}</strong></div>
                <label className="mt-2 text-sm"><input type="checkbox" checked={!!(JSON.parse(localStorage.getItem("tf_selected_candidates")||"[]").includes(c.id))} onChange={(e)=>{
                  const raw = localStorage.getItem("tf_selected_candidates")||"[]";
                  const arr = new Set(JSON.parse(raw) as string[]);
                  if(arr.has(c.id)) arr.delete(c.id); else arr.add(c.id);
                  localStorage.setItem("tf_selected_candidates", JSON.stringify(Array.from(arr)));
                  // force update
                  setData((d:any)=> ({...d}));
                }} /> Select</label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Page {data?.page || 1} of {Math.ceil((data?.total || 0)/PAGE_SIZE) || 1}</div>
        <div className="flex gap-2">
          <button className="px-3 py-2 border rounded" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
          <button className="px-3 py-2 border rounded" disabled={page >= Math.ceil((data?.total || 0)/PAGE_SIZE)} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      </div>
    </div>
  );
}
