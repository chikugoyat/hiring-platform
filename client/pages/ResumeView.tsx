import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ResumeView() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const r = await fetch(`/api/candidates?search=&stage=&page=1&pageSize=1000`);
      const data = await r.json();
      const cand = (data.items || []).find((c: any) => c.id === id);
      if (!mounted) return;
      setCandidate(cand || null);
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  if (!candidate) return <div>Loading...</div>;

  const [jobTitle, setJobTitle] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const r = await fetch(`/api/jobs?search=&status=&page=1&pageSize=1000`);
      const jdata = await r.json();
      const job = (jdata.items || []).find((j: any) => j.id === candidate.jobId);
      if (!mounted) return;
      setJobTitle(job ? job.title : candidate.jobId);
    })();
    return () => { mounted = false; };
  }, [candidate]);

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Resume - ${candidate.name}</title><style>body{font-family:Inter,system-ui,Arial;padding:20px}h1{color:#0f172a}</style></head><body><h1>${candidate.name}</h1><p><strong>Email:</strong> ${candidate.email}</p><p><strong>Applied to:</strong> ${jobTitle}</p><p><strong>Skills:</strong> ${candidate.skills?.join(", ")}</p><p><strong>Experience:</strong> ${candidate.experience} years</p><p><strong>LinkedIn:</strong> ${candidate.linkedin}</p><hr/><p>This is a mock resume for demo purposes.</p></body></html>`;

  function download() {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${candidate.name.replace(/\s+/g, "_")}_resume.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto bg-card border rounded p-6">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">{candidate.name.split(" ").map((s:string)=>s[0]).slice(0,2).join("")}</div>
          <div>
            <div className="text-2xl font-bold">{candidate.name}</div>
            <div className="text-sm text-muted-foreground">{candidate.email} • {candidate.linkedin}</div>
          </div>
          <div className="ml-auto flex gap-2">
            <button className="px-3 py-2 rounded bg-primary text-primary-foreground" onClick={download}>Download Resume</button>
            <a className="px-3 py-2 rounded border" href={candidate.resumeUrl} target="_blank" rel="noreferrer">External Resume Link</a>
          </div>
        </div>

        <div className="mt-6 bg-white p-4 rounded">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </div>
  );
}
