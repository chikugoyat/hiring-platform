export default function Placeholder({ title }: { title: string }) {
  return (
    <div className="rounded-xl border p-6 bg-card">
      <div className="font-semibold mb-2">{title}</div>
      <p className="text-sm text-muted-foreground">Coming soon.</p>
    </div>
  );
}
