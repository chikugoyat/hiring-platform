import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border p-8 card-accent transition-interactive hover:shadow-lg">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight hover:scale-105 transition-interactive">Talent Flow</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl hover:scale-103 transition-interactive">
          Manage jobs, candidates, and assessments in one modern, fast interface. Drag to reorder jobs, track candidates across stages, and build job-specific assessments with live preview.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="px-4 py-2 rounded-md bg-primary text-primary-foreground transition-interactive hover:scale-105" to="/jobs">Open Jobs Board</Link>
          <Link className="px-4 py-2 rounded-md border transition-interactive hover:scale-105" to="/candidates">Browse Candidates</Link>
          <Link className="px-4 py-2 rounded-md border transition-interactive hover:scale-105" to="/assessments">Assessment Builder</Link>
        </div>
      </section>
      <section className="grid md:grid-cols-3 gap-4">
        <Card to="/jobs" title="Jobs" desc="Create, edit, archive, and reorder with optimistic updates." accent="card-accent" />
        <Card to="/candidates" title="Candidates" desc="Virtualized list and kanban for stage transitions with notes." accent="card-accent-2" />
        <Card to="/assessments" title="Assessments" desc="Builder with live preview, validation and conditional logic." accent="card-accent" />
      </section>
    </div>
  );
}

function Card({ title, desc, accent, to }: { title: string; desc: string; accent?: string; to?: string }) {
  const inner = (
    <div className={`rounded-xl border p-5 bg-card transition-interactive hover-enlarge ${accent || ""}`}>
      <div className="font-semibold text-lg">{title}</div>
      <div className="text-sm text-muted-foreground mt-1">{desc}</div>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}
