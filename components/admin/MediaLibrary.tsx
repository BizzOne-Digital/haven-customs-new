"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Eraser, Loader2, Trash2 } from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";
import { UPLOAD_FOLDERS } from "@/lib/constants";
import { api, errMsg } from "./api";
import { useToast } from "./Toast";
import { Badge, PageTitle, Pager } from "./ui";

type Item = { id: string; url: string; folder: string; filename: string; originalName: string; size: number; mimeType: string; createdAt: string; usage: number };
const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

export default function MediaLibrary() {
  const toast = useToast();
  const [folder, setFolder] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: Item[]; total: number; limit: number } | null>(null);
  const [cleaning, setCleaning] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await api(`/api/admin/media?page=${page}${folder ? `&folder=${folder}` : ""}`));
    } catch (e) {
      toast.error(errMsg(e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, folder]);
  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  async function del(i: Item) {
    if (!confirm(`Delete ${i.originalName || i.filename}?`)) return;
    try {
      await api(`/api/admin/media?folder=${i.folder}&filename=${i.filename}`, { method: "DELETE" });
      toast.success("Deleted");
      load();
    } catch (e) {
      toast.error(errMsg(e));
    }
  }

  async function cleanup() {
    if (!confirm("Delete every uploaded image that is not used anywhere and is older than 24 hours?")) return;
    setCleaning(true);
    try {
      const r = await api<{ deleted: number }>("/api/admin/media/cleanup", { method: "POST" });
      toast.success(`Removed ${r.deleted} unused image(s)`);
      load();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setCleaning(false);
    }
  }

  return (
    <div>
      <PageTitle title="Media" sub="Images uploaded through the admin. Stored in MongoDB.">
        <button onClick={cleanup} disabled={cleaning} className="btn btn-outline disabled:opacity-50">
          {cleaning ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Eraser className="h-4 w-4" aria-hidden />} Clean up unused
        </button>
      </PageTitle>
      <div role="group" aria-label="Folder" className="mb-4 flex flex-wrap gap-2">
        {["", ...UPLOAD_FOLDERS].map((f) => (
          <button key={f} aria-pressed={folder === f} onClick={() => { setFolder(f); setPage(1); }} className={`min-h-[38px] border px-3 text-xs font-semibold uppercase tracking-wide ${folder === f ? "border-race bg-race text-white" : "border-mist bg-white text-ink"}`}>
            {f || "All"}
          </button>
        ))}
      </div>
      {!data ? <Loader2 className="mx-auto h-5 w-5 animate-spin text-steel" aria-label="Loading" /> : data.items.length === 0 ? <p className="text-sm text-steel">No uploads yet.</p> : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.items.map((i) => (
            <li key={i.id} className="border border-cloud bg-white">
              <div className="relative aspect-[4/3] bg-cloud"><SafeImage src={i.url} alt={i.originalName} fill sizes="300px" className="object-cover" /></div>
              <div className="space-y-1 p-3 text-xs">
                <p className="truncate font-semibold text-ink" title={i.originalName}>{i.originalName || i.filename}</p>
                <p className="text-steel">{i.folder} · {kb(i.size)} · {i.mimeType.replace("image/", "")}</p>
                <div className="flex items-center justify-between pt-1">
                  {i.usage > 0 ? <Badge tone="green">Used in {i.usage}</Badge> : <Badge tone="amber">Unused</Badge>}
                  <div className="flex gap-1">
                    <button onClick={() => { navigator.clipboard.writeText(i.url); toast.success("URL copied"); }} aria-label="Copy URL" className="grid h-8 w-8 place-items-center text-steel hover:text-ink"><Copy className="h-4 w-4" /></button>
                    <button onClick={() => del(i)} disabled={i.usage > 0} aria-label="Delete" title={i.usage > 0 ? "In use — remove it from content first" : "Delete"} className="grid h-8 w-8 place-items-center text-steel hover:text-race disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {data && <Pager page={page} total={data.total} limit={data.limit} onPage={setPage} />}
    </div>
  );
}
