import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Job, JobStatus } from "@/utils/db";

export function JobModal({
  trigger,
  initial,
  onSave,
}: {
  trigger: React.ReactNode;
  initial?: Partial<Job>;
  onSave: (data: Partial<Job>) => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initial?.title || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [status, setStatus] = useState<JobStatus>((initial?.status as JobStatus) || "active");
  const [tags, setTags] = useState<string>((initial?.tags || [""]).join(", "));
  const [description, setDescription] = useState(initial?.description || "");
  const [requirements, setRequirements] = useState<string>((initial?.requirements || []).join("\n"));
  const [stipend, setStipend] = useState(initial?.stipend || "");
  const [deadline, setDeadline] = useState(initial?.deadline?.slice(0, 10) || "");
  const [scope, setScope] = useState(initial?.scope || "");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    if (!initial) {
      setTitle("");
      setSlug("");
      setStatus("active");
      setTags("");
      setDescription("");
      setRequirements("");
      setStipend("");
      setDeadline("");
      setScope("");
      setError("");
    }
  };

  async function handleSave() {
    try {
      setLoading(true);
      setError("");
      const payload: Partial<Job> = {
        ...initial,
        title: title.trim(),
        slug: slug.trim() || undefined,
        status,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        description,
        requirements: requirements
          .split("\n")
          .map((r) => r.trim())
          .filter(Boolean),
        stipend: stipend || undefined,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        scope,
      };
      if (!payload.title) {
        setError("Title is required");
        return;
      }
      await onSave(payload);
      setOpen(false);
      reset();
    } catch (e: any) {
      setError(e?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial?.id ? "Edit Job" : "Create Job"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input className="w-full border rounded-md px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Slug</label>
            <input className="w-full border rounded-md px-3 py-2" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto from title" />
          </div>
          <div>
            <label className="block text-sm mb-1">Status</label>
            <select className="w-full border rounded-md px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value as JobStatus)}>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="archived">Archived</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Tags (comma separated)</label>
            <input className="w-full border rounded-md px-3 py-2" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Description</label>
            <textarea className="w-full border rounded-md px-3 py-2" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Requirements (one per line)</label>
            <textarea className="w-full border rounded-md px-3 py-2" rows={3} value={requirements} onChange={(e) => setRequirements(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Stipend</label>
            <input className="w-full border rounded-md px-3 py-2" value={stipend} onChange={(e) => setStipend(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Deadline</label>
            <input type="date" className="w-full border rounded-md px-3 py-2" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Scope</label>
            <input className="w-full border rounded-md px-3 py-2" value={scope} onChange={(e) => setScope(e.target.value)} />
          </div>
        </div>
        {error ? <div className="text-red-600 text-sm">{error}</div> : null}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
