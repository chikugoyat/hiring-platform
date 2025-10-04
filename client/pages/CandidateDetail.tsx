import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function CandidateDetail() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState<any | null>(null);
  const [jobTitle, setJobTitle] = useState<string>("");
  const [selected, setSelected] = useState<boolean>(false);
  const [avatarColor, setAvatarColor] = useState<string>("#94a3b8");

  useEffect(() => {
    let mounted = true;
    async function load() {
      const r = await fetch(`/api/candidates?search=&stage=&page=1&pageSize=1000`);
      const data = await r.json();
      const cand = (data.items || []).find((c: any) => c.id === id);
      if (!mounted) return;
      setCandidate(cand || null);
      if (cand) {
        const jr = await fetch(`/api/jobs?search=&status=&page=1&pageSize=1000`);
        const jdata = await jr.json();
        const job = (jdata.items || []).find((j: any) => j.id === cand.jobId);
        if (job) setJobTitle(job.title);
      }
      const sel = localStorage.getItem("tf_selected_candidates") || "[]";
      const arr = JSON.parse(sel) as string[];
      setSelected(arr.includes(id || ""));
      const color = localStorage.getItem(`avatar_color_${id}`) || "#94a3b8";
      setAvatarColor(color);
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  function toggleSelect() {
    const raw = localStorage.getItem("tf_selected_candidates") || "[]";
    const arr = new Set(JSON.parse(raw) as string[]);
    if (!id) return;
    if (arr.has(id)) arr.delete(id);
    else arr.add(id);
    localStorage.setItem("tf_selected_candidates", JSON.stringify(Array.from(arr)));
    setSelected(arr.has(id));
  }

  function downloadResume() {
    if (!candidate) return;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Resume - ${candidate.name}</title></head><body><h1>${candidate.name}</h1><p><strong>Email:</strong> ${candidate.email}</p><p><strong>Applied to:</strong> ${jobTitle}</p><p><strong>Skills:</strong> ${candidate.skills?.join(", ")}</p><p><strong>Experience:</strong> ${candidate.experience} years</p><p><strong>LinkedIn:</strong> ${candidate.linkedin}</p></body></html>`;
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

  function saveAvatarColor() {
    if (!id) return;
    localStorage.setItem(`avatar_color_${id}`, avatarColor);
    alert("Saved avatar color for candidate");
  }

  if (!candidate) return <div>Loading candidate...</div>;

  return (
    <div className="rounded-xl border p-6 bg-card space-y-4">
      <div className="flex items-center gap-4">
        <div style={{ background: avatarColor }} className="h-20 w-20 rounded-full flex items-center justify-center text-xl text-white">{candidate.name.split(" ").map((s: string)=>s[0]).slice(0,2).join("")}</div>
        <div>
          <div className="text-2xl font-bold">{candidate.name}</div>
          <div className="text-sm text-muted-foreground">{candidate.email}</div>
          <div className="mt-2 text-sm">Applied to: <strong>{jobTitle}</strong></div>
        </div>
        <div className="ml-auto flex flex-col gap-2">
          <label className="flex items-center gap-2"><input type="checkbox" checked={selected} onChange={toggleSelect} /> Select</label>
          <button className="px-3 py-2 rounded bg-primary text-primary-foreground" onClick={downloadResume}>Download Resume</button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div><strong>Address:</strong> {candidate.address}</div>
          <div><strong>Age:</strong> {candidate.age}</div>
          <div><strong>Experience:</strong> {candidate.experience} years</div>
          <div><strong>LinkedIn:</strong> <a className="text-primary hover:underline" href={candidate.linkedin} target="_blank" rel="noreferrer">Profile</a></div>
          <div><strong>Gender:</strong> {candidate.gender}</div>
        </div>
        <div>
          <div><strong>Skills</strong></div>
          <div className="mt-2 flex flex-wrap gap-2">{candidate.skills?.map((s:string)=> <span key={s} className="px-2 py-1 bg-accent rounded text-sm">{s}</span>)}</div>

          <div className="mt-4">
            <div className="font-medium">Customize avatar color</div>
            <input type="color" value={avatarColor} onChange={(e)=>setAvatarColor(e.target.value)} className="mt-2" />
            <div className="mt-2 flex gap-2">
              <button className="px-3 py-1 border rounded" onClick={saveAvatarColor}>Save</button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="font-semibold mb-2">Resume Preview</div>
        <div className="p-4 bg-white rounded shadow-sm">
          <h3 className="text-lg font-bold">{candidate.name}</h3>
          <div className="text-sm text-muted-foreground">{candidate.email} • {candidate.linkedin}</div>
          <div className="mt-2">{candidate.skills?.join(", ")}</div>
          <div className="mt-4">Experience: {candidate.experience} years</div>
          <div className="mt-4 text-right">
            <Link to={`/resume/${candidate.id}`} className="px-3 py-2 rounded bg-primary text-primary-foreground">Open Resume</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
