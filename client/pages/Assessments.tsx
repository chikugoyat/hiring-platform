import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export default function AssessmentsPage() {
  const qc = useQueryClient();
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const { data: jobsData } = useQuery({
    queryKey: ["jobs-list-all"],
    queryFn: async () => {
      const r = await fetch(`/api/jobs?search=&status=&page=1&pageSize=1000`);
      return r.ok ? r.json() : { items: [] };
    },
  });

  const { data: assessment } = useQuery({
    queryKey: ["assessment", selectedJob],
    queryFn: async () => {
      if (!selectedJob) return null;
      const r = await fetch(`/api/assessments/${selectedJob}`);
      if (!r.ok) throw new Error("Failed to load");
      return r.json();
    },
    enabled: !!selectedJob,
  });

  const saveMut = useMutation({
    mutationFn: async ({ jobId, sections }: any) => {
      const r = await fetch(`/api/assessments/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections }),
      });
      if (!r.ok) throw new Error("Failed to save");
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assessment", selectedJob] }),
  });

  async function addAssignment() {
    if (!selectedJob) return;
    const sections = assessment?.sections || [];
    const jobTitle = jobsData?.items?.find((j: any) => j.id === selectedJob)?.title || "";
    const newSection = {
      id: `${selectedJob}-sec-${(sections.length || 0) + 1}`,
      title: `Assignment ${(sections.length || 0) + 1}`,
      questions: generateQuickQuestions(selectedJob, sections.length || 0, jobTitle),
    };
    await saveMut.mutateAsync({ jobId: selectedJob, sections: [...sections, newSection] });
    qc.invalidateQueries({ queryKey: ["assessment", selectedJob] });
  }

  const [localSections, setLocalSections] = useState<any[] | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // sync assessment to localSections when loaded
  useEffect(() => {
    if (assessment?.sections) setLocalSections(JSON.parse(JSON.stringify(assessment.sections)));
    else setLocalSections(null);
  }, [assessment?.sections]);

  async function saveAll() {
    if (!selectedJob || !localSections) return;
    await saveMut.mutateAsync({ jobId: selectedJob, sections: localSections });
    qc.invalidateQueries({ queryKey: ["assessment", selectedJob] });
    setEditingSection(null);
  }

  function startEdit(id: string) {
    setEditingSection(id);
  }

  function updateQuestion(sectionId: string, qIndex: number, patch: any) {
    setLocalSections((prev) =>
      prev?.map((s) => {
        if (s.id !== sectionId) return s;
        const next = { ...s };
        next.questions = [...next.questions];
        next.questions[qIndex] = { ...next.questions[qIndex], ...patch };
        return next;
      }) || null,
    );
  }

  function addQuestion(sectionId: string) {
    setLocalSections((prev) =>
      prev?.map((s) => {
        if (s.id !== sectionId) return s;
        const id = `${sectionId}-q-${Date.now()}`;
        const q = { id, type: "short_text", label: "New question", required: false };
        return { ...s, questions: [...s.questions, q] };
      }) || null,
    );
  }

  function deleteQuestion(sectionId: string, qIndex: number) {
    setLocalSections((prev) =>
      prev?.map((s) => {
        if (s.id !== sectionId) return s;
        const next = { ...s };
        next.questions = next.questions.filter((_: any, i: number) => i !== qIndex);
        return next;
      }) || null,
    );
  }

  function updateSectionTitle(sectionId: string, title: string) {
    setLocalSections((prev) => prev?.map((s) => (s.id === sectionId ? { ...s, title } : s)) || null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm">Select Job</label>
        <select className="border rounded px-3 py-2" value={selectedJob ?? ""} onChange={(e) => setSelectedJob(e.target.value || null)}>
          <option value="">-- select a job --</option>
          {jobsData?.items?.map((j: any) => (
            <option key={j.id} value={j.id}>{j.title}</option>
          ))}
        </select>
        <button className="ml-auto px-4 py-2 rounded bg-primary text-primary-foreground" onClick={addAssignment}>Add Assignment</button>
      </div>

      {!selectedJob ? (
        <div className="rounded-xl border p-6 bg-card">
          <div className="font-semibold mb-2">Assessments</div>
          <p className="text-sm text-muted-foreground">Choose a job to edit its assessments. You can add assignments manually; each adds 10 starter questions across coding, logical, MCQ and GK types.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="font-semibold">{jobsData?.items?.find((j: any) => j.id === selectedJob)?.title}</div>
          {(localSections || []).map((s: any) => (
            <div key={s.id} className="border rounded p-3 bg-card">
              <div className="flex items-center justify-between">
                {editingSection === s.id ? (
                  <input className="font-medium w-full mr-4" value={s.title} onChange={(e) => updateSectionTitle(s.id, e.target.value)} />
                ) : (
                  <div className="font-medium">{s.title}</div>
                )}
                <div className="flex gap-2">
                  {editingSection === s.id ? (
                    <>
                      <button className="px-3 py-1 border rounded" onClick={saveAll}>Save</button>
                      <button className="px-3 py-1 border rounded" onClick={() => setEditingSection(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="px-3 py-1 border rounded" onClick={() => startEdit(s.id)}>Edit</button>
                      <button className="px-3 py-1 border rounded" onClick={() => addQuestion(s.id)}>Add Question</button>
                    </>
                  )}
                </div>
              </div>

              <div className="text-sm text-muted-foreground">{s.questions.length} questions</div>
              <ol className="mt-2 list-decimal pl-6 space-y-1 text-sm">
                {s.questions.map((q: any, qi: number) => (
                  <li key={q.id} className="py-1">
                    {editingSection === s.id ? (
                      <div className="space-y-2">
                        <input className="w-full border rounded px-2 py-1" value={q.label} onChange={(e) => updateQuestion(s.id, qi, { label: e.target.value })} />
                        <div className="flex gap-2">
                          <select value={q.type} onChange={(e) => updateQuestion(s.id, qi, { type: e.target.value })} className="border rounded px-2 py-1">
                            <option value="short_text">Short Text</option>
                            <option value="long_text">Long Text</option>
                            <option value="single_choice">Single Choice</option>
                            <option value="multi_choice">Multi Choice</option>
                            <option value="numeric">Numeric</option>
                            <option value="file">File</option>
                          </select>
                          <label className="flex items-center gap-2"><input type="checkbox" checked={!!q.required} onChange={(e) => updateQuestion(s.id, qi, { required: e.target.checked })} /> Required</label>
                          <button className="px-2 py-1 border rounded" onClick={() => deleteQuestion(s.id, qi)}>Delete</button>
                        </div>
                        {(q.type === "single_choice" || q.type === "multi_choice") && (
                          <textarea className="w-full border rounded px-2 py-1" value={(q.options || []).join('\n')} onChange={(e) => updateQuestion(s.id, qi, { options: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })} placeholder="One option per line" />
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium hover:scale-105 transition-interactive">{q.label}</div>
                        <div className="text-xs text-muted-foreground">{q.type}{q.topic ? ` • ${q.topic}` : ""}{q.options ? ` • ${q.options.length} options` : ""}</div>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function generateQuickQuestions(jobId: string, seed: number, jobTitle: string) {
  const title = (jobTitle || "").toLowerCase();
  const sde = [
    "Write a function to reverse a linked list and explain its complexity.",
    "Implement binary search and handle edge cases.",
    "Describe how you'd design a caching layer for a web app.",
    "Implement a function to check balanced parentheses.",
    "Explain how to detect cycles in a graph.",
  ];
  const data = [
    "Write SQL to find top 5 customers by revenue.",
    "Explain how you'd validate a machine learning model.",
    "Describe methods to handle missing data.",
    "What is precision vs recall?",
    "How would you A/B test a feature?",
  ];
  const design = [
    "Design a landing page for a new mobile app focused on onboarding.",
    "How would you improve accessibility for a web form?",
    "Sketch a responsive card layout for mixed content.",
    "Describe how you'd run a usability test.",
    "Explain your process for creating a user persona.",
  ];
  const hr = [
    "How would you screen candidates for a senior engineer role?",
    "Describe an inclusive hiring strategy.",
    "How do you measure recruitment funnel efficiency?",
    "Write a short candidate rejection email template.",
    "Explain handling a dispute between teammates.",
  ];
  const sales = [
    "Draft an elevator pitch for a B2B SaaS product.",
    "How would you handle price objections?",
    "Describe qualifying questions for discovery calls.",
    "Explain negotiation tactics for closing deals.",
    "How would you prioritize leads?",
  ];

  const logical = [
    "You have 9 balls with one lighter. How to find it in 2 weighings?",
    "If a car travels 150 km in 3 hours, what's the average speed?",
    "Explain solving the river crossing puzzle.",
  ];
  const gk = [
    { q: "What does HTML stand for?", options: ["HyperText Markup Language","HighText Machine Language","HyperText Markdown Language","Hyperlink Text Markup"] },
    { q: "Which protocol is used for secure web browsing?", options: ["HTTPS","FTP","SMTP","TELNET"] },
    { q: "Which status code means Not Found?", options: ["404","200","500","301"] },
  ];

  const qs: any[] = [];
  for (let i = 0; i < 10; i++) {
    const id = `${jobId}-q-${seed}-${i}-${Date.now()}`;
    const mod = i % 4;
    if (mod === 0) {
      let text = sde[i % sde.length];
      if (title.includes("data") || title.includes("analyst") || title.includes("scientist")) text = data[i % data.length];
      if (title.includes("design") || title.includes("ux") || title.includes("ui")) text = design[i % design.length];
      if (title.includes("hr") || title.includes("recruit")) text = hr[i % hr.length];
      if (title.includes("sales") || title.includes("marketing")) text = sales[i % sales.length];
      qs.push({ id, type: "long_text", label: text, topic: "coding", required: true });
    } else if (mod === 1) qs.push({ id, type: "short_text", label: logical[i % logical.length], topic: "logical" });
    else if (mod === 2) qs.push({ id, type: "single_choice", label: gk[i % gk.length].q, topic: "gk", options: gk[i % gk.length].options });
    else qs.push({ id, type: "multi_choice", label: gk[i % gk.length].q, topic: "mcq", options: gk[i % gk.length].options });
  }
  return qs;
}
