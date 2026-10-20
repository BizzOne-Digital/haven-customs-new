"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Loader2, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";
import { api, errMsg } from "./api";
import { useToast } from "./Toast";
import { Badge, PageTitle, Pager } from "./ui";

type Row = {
  _id: string; name: string; slug: string; isActive: boolean; isFeatured: boolean; needsReview: boolean;
  category?: { name: string } | null; images: { url: string }[]; internalPrice?: string; sortOrder: number;
};

export default function ProductsTable({ categories }: { categories: { id: string; name: string }[] }) {
  const sp = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [category, setCategory] = useState(sp.get("category") ?? "");
  const [status, setStatus] = useState(sp.get("isActive") ?? (sp.get("needsReview") ? "review" : ""));
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: Row[]; total: number; limit: number } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const p = new URLSearchParams({ page: String(page), limit: "50" });
    if (q) p.set("q", q);
    if (category) p.set("category", category);
    if (status === "true" || status === "false") p.set("isActive", status);
    if (status === "review") p.set("needsReview", "true");
    try {
      setData(await api(`/api/admin/products?${p}`));
    } catch (e) {
      toast.error(errMsg(e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, status, page]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  async function act(id: string, fn: () => Promise<unknown>, okMsg: string) {
    setBusy(id);
    try {
      await fn();
      toast.success(okMsg);
      await load();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(null);
    }
  }

  async function move(index: number, dir: -1 | 1) {
    if (!data) return;
    const items = [...data.items];
    const j = index + dir;
    if (j < 0 || j >= items.length) return;
    [items[index], items[j]] = [items[j], items[index]];
    setData({ ...data, items });
    await act(items[j]._id, () => api("/api/admin/products/reorder", { body: { ids: items.map((i) => i._id) } }), "Order saved");
  }

  return (
    <div>
      <PageTitle title="Products" sub="Everything listed on the public Services pages.">
        <Link href="/admin/products/new" className="btn btn-red"><Plus className="h-4 w-4" aria-hidden /> New product</Link>
      </PageTitle>

      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px_180px]">
        <label className="relative">
          <span className="sr-only">Search</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" aria-hidden />
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search name, slug, brand…" className="field pl-9" />
        </label>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="field" aria-label="Category">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); router.replace("/admin/products"); }} className="field" aria-label="Status">
          <option value="">Any status</option>
          <option value="true">Active</option>
          <option value="false">Hidden</option>
          <option value="review">Needs review</option>
        </select>
      </div>

      <div className="overflow-x-auto border border-cloud bg-white">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-pearl text-left text-xs uppercase tracking-wide text-steel">
            <tr>
              <th className="w-16 px-3 py-3">Order</th>
              <th className="px-3 py-3">Product</th>
              <th className="px-3 py-3">Category</th>
              <th className="px-3 py-3">Internal price</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cloud">
            {!data && (
              <tr><td colSpan={6} className="px-3 py-10 text-center text-steel"><Loader2 className="mx-auto h-5 w-5 animate-spin" aria-label="Loading" /></td></tr>
            )}
            {data?.items.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-10 text-center text-steel">No products match.</td></tr>
            )}
            {data?.items.map((r, i) => (
              <tr key={r._id} className={busy === r._id ? "opacity-50" : ""}>
                <td className="px-3 py-2">
                  <div className="flex flex-col">
                    <button onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${r.name} up`} className="grid h-6 w-8 place-items-center text-steel hover:text-ink disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" /></button>
                    <button onClick={() => move(i, 1)} disabled={i === data.items.length - 1} aria-label={`Move ${r.name} down`} className="grid h-6 w-8 place-items-center text-steel hover:text-ink disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="relative h-11 w-16 shrink-0 overflow-hidden bg-cloud">
                      <SafeImage src={r.images[0]?.url} alt="" fill sizes="64px" className="object-cover" />
                    </div>
                    <div>
                      <Link href={`/admin/products/${r._id}/edit`} className="font-semibold text-ink hover:text-race">{r.name}</Link>
                      <p className="text-xs text-steel">/{r.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 text-graphite">{r.category?.name ?? "—"}</td>
                <td className="max-w-[220px] truncate px-3 py-2 text-xs text-steel" title={r.internalPrice}>{r.internalPrice || "—"}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {r.isActive ? <Badge tone="green">Active</Badge> : <Badge>Hidden</Badge>}
                    {r.isFeatured && <Badge tone="red">Featured</Badge>}
                    {r.needsReview && <Badge tone="amber">Review</Badge>}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-1">
                    <IconBtn label={r.isActive ? "Hide" : "Show"} onClick={() => act(r._id, () => api(`/api/admin/products/${r._id}`, { method: "PATCH", body: { isActive: !r.isActive, ...(r.isActive ? {} : { needsReview: false }) } }), r.isActive ? "Hidden from site" : "Now live")}>
                      {r.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </IconBtn>
                    <IconBtn label={r.isFeatured ? "Unfeature" : "Feature"} onClick={() => act(r._id, () => api(`/api/admin/products/${r._id}`, { method: "PATCH", body: { isFeatured: !r.isFeatured } }), "Saved")}>
                      <Star className={`h-4 w-4 ${r.isFeatured ? "fill-race text-race" : ""}`} />
                    </IconBtn>
                    <IconBtn label="Edit" href={`/admin/products/${r._id}/edit`}><Pencil className="h-4 w-4" /></IconBtn>
                    <IconBtn label="Duplicate" onClick={() => act(r._id, () => api(`/api/admin/products/${r._id}/duplicate`, { method: "POST" }), "Duplicated (hidden copy created)")}>
                      <Copy className="h-4 w-4" />
                    </IconBtn>
                    <IconBtn label="Delete" danger onClick={() => confirm(`Delete “${r.name}”? This cannot be undone.`) && act(r._id, () => api(`/api/admin/products/${r._id}`, { method: "DELETE" }), "Deleted")}>
                      <Trash2 className="h-4 w-4" />
                    </IconBtn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data && <Pager page={page} total={data.total} limit={data.limit} onPage={setPage} />}
    </div>
  );
}

export function IconBtn({ label, onClick, href, danger, children }: { label: string; onClick?: () => void; href?: string; danger?: boolean; children: React.ReactNode }) {
  const cls = `grid h-9 w-9 place-items-center border border-transparent text-steel hover:border-mist ${danger ? "hover:text-race" : "hover:text-ink"}`;
  if (href) return <Link href={href} aria-label={label} title={label} className={cls}>{children}</Link>;
  return <button type="button" onClick={onClick} aria-label={label} title={label} className={cls}>{children}</button>;
}
