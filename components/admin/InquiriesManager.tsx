"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Download, Loader2, RefreshCw, Search, Trash2 } from "lucide-react";
import { INQUIRY_STATUSES } from "@/lib/constants";
import { api, errMsg } from "./api";
import { useToast } from "./Toast";
import { Badge, Modal, PageTitle, Pager } from "./ui";

type Inq = {
  _id: string; fullName: string; phone: string; email: string; vehicleType: string; vehicleMake: string; vehicleModel: string; vehicleYear: string;
  products: { slug: string; name: string }[]; tiresOnRims: string; message: string; preferredContactMethod: string; status: string;
  ghlStatus: string; ghlError: string; ghlAttempts: number; ghlContactId: string; metaStatus: string; notes: string; createdAt: string; sourceUrl: string;
};

const ghlTone = (s: string) => (s === "sent" ? "green" : s === "failed" ? "red" : s === "pending" ? "amber" : "gray") as "green" | "red" | "amber" | "gray";

export default function InquiriesManager() {
  const sp = useSearchParams();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [ghl, setGhl] = useState(sp.get("ghl") ?? "");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: Inq[]; total: number; limit: number } | null>(null);
  const [open, setOpen] = useState<Inq | null>(null);
  const [busy, setBusy] = useState(false);

  const params = useCallback(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (status) p.set("status", status);
    if (ghl) p.set("ghl", ghl);
    return p;
  }, [q, status, ghl]);

  const load = useCallback(async () => {
    const p = params();
    p.set("page", String(page));
    try {
      setData(await api(`/api/admin/inquiries?${p}`));
    } catch (e) {
      toast.error(errMsg(e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, page]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    const id = sp.get("open");
    if (id) api<{ item: Inq }>(`/api/admin/inquiries/${id}`).then((r) => setOpen(r.item)).catch(() => null);
  }, [sp]);

  async function update(body: Partial<Pick<Inq, "status" | "notes">>) {
    if (!open) return;
    setBusy(true);
    try {
      const r = await api<{ item: Inq }>(`/api/admin/inquiries/${open._id}`, { method: "PATCH", body });
      setOpen(r.item);
      toast.success("Saved");
      load();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  async function retry() {
    if (!open) return;
    setBusy(true);
    try {
      const r = await api<{ item: Inq }>(`/api/admin/inquiries/${open._id}/retry`, { method: "POST" });
      setOpen(r.item);
      if (r.item.ghlStatus === "sent") toast.success("Delivered to GHL");
      else toast.error(r.item.ghlStatus === "not_configured" ? "GHL is not configured" : `Still failing: ${r.item.ghlError}`);
      load();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!open || !confirm(`Delete inquiry from ${open.fullName}?`)) return;
    try {
      await api(`/api/admin/inquiries/${open._id}`, { method: "DELETE" });
      setOpen(null);
      toast.success("Deleted");
      load();
    } catch (e) {
      toast.error(errMsg(e));
    }
  }

  return (
    <div>
      <PageTitle title="Inquiries" sub="Quote requests from the website.">
        <a href={`/api/admin/inquiries/export?${params()}`} className="btn btn-outline"><Download className="h-4 w-4" aria-hidden /> Export CSV</a>
      </PageTitle>
      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px_200px]">
        <label className="relative">
          <span className="sr-only">Search</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" aria-hidden />
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Name, phone, email, service, vehicle…" className="field pl-10!" />
        </label>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="field" aria-label="Status">
          <option value="">All statuses</option>
          {INQUIRY_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={ghl} onChange={(e) => { setGhl(e.target.value); setPage(1); }} className="field" aria-label="GHL delivery">
          <option value="">Any GHL status</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
          <option value="not_configured">Not configured</option>
        </select>
      </div>

      <div className="overflow-x-auto border border-cloud bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-pearl text-left text-xs uppercase tracking-wide text-steel">
            <tr><th className="px-3 py-3">Received</th><th className="px-3 py-3">Customer</th><th className="px-3 py-3">Services</th><th className="px-3 py-3">Vehicle</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">GHL</th></tr>
          </thead>
          <tbody className="divide-y divide-cloud">
            {!data && <tr><td colSpan={6} className="py-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-steel" aria-label="Loading" /></td></tr>}
            {data?.items.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-steel">No inquiries found.</td></tr>}
            {data?.items.map((i) => (
              <tr key={i._id} onClick={() => setOpen(i)} className="cursor-pointer hover:bg-pearl">
                <td className="whitespace-nowrap px-3 py-3 text-xs text-steel">{new Date(i.createdAt).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" })}</td>
                <td className="px-3 py-3"><button className="text-left font-semibold text-ink hover:text-race">{i.fullName}</button><p className="text-xs text-steel">{i.phone}</p></td>
                <td className="max-w-[260px] truncate px-3 py-3 text-graphite">{i.products.map((p) => p.name).join(", ")}</td>
                <td className="px-3 py-3 text-xs text-graphite">{i.vehicleType}</td>
                <td className="px-3 py-3"><Badge tone={i.status === "New" ? "red" : i.status === "Booked" ? "green" : "gray"}>{i.status}</Badge></td>
                <td className="px-3 py-3"><Badge tone={ghlTone(i.ghlStatus)}>{i.ghlStatus.replace("_", " ")}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data && <Pager page={page} total={data.total} limit={data.limit} onPage={setPage} />}

      <Modal wide open={!!open} onClose={() => setOpen(null)} title={open?.fullName ?? ""}>
        {open && (
          <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
            <dl className="grid grid-cols-[130px_1fr] gap-x-4 gap-y-3 text-sm">
              <dt className="text-steel">Phone</dt><dd><a href={`tel:${open.phone}`} className="font-semibold text-ink hover:text-race">{open.phone}</a></dd>
              <dt className="text-steel">Email</dt><dd>{open.email ? <a href={`mailto:${open.email}`} className="hover:text-race">{open.email}</a> : "—"}</dd>
              <dt className="text-steel">Contact via</dt><dd>{open.preferredContactMethod}</dd>
              <dt className="text-steel">Vehicle</dt><dd>{open.vehicleType}{[open.vehicleYear, open.vehicleMake, open.vehicleModel].some(Boolean) && ` · ${[open.vehicleYear, open.vehicleMake, open.vehicleModel].filter(Boolean).join(" ")}`}</dd>
              <dt className="text-steel">Services</dt><dd>{open.products.map((p) => p.name).join(", ")}</dd>
              {open.tiresOnRims && (<><dt className="text-steel">Tires</dt><dd>{open.tiresOnRims}</dd></>)}
              <dt className="text-steel">Message</dt><dd className="whitespace-pre-line">{open.message || "—"}</dd>
              <dt className="text-steel">Received</dt><dd>{new Date(open.createdAt).toLocaleString("en-CA")}</dd>
              {open.sourceUrl && (<><dt className="text-steel">Page</dt><dd className="truncate text-xs">{open.sourceUrl}</dd></>)}
            </dl>
            <div className="space-y-5">
              <label className="block">
                <span className="label">Status</span>
                <select value={open.status} disabled={busy} onChange={(e) => update({ status: e.target.value })} className="field">
                  {INQUIRY_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <div className="border border-cloud p-4 text-sm">
                <p className="mb-2 flex items-center justify-between font-semibold text-ink">GHL delivery <Badge tone={ghlTone(open.ghlStatus)}>{open.ghlStatus.replace("_", " ")}</Badge></p>
                <p className="text-xs text-steel">Attempts: {open.ghlAttempts}{open.ghlContactId && ` · Contact ${open.ghlContactId}`}</p>
                {open.ghlError && <p className="mt-1 text-xs text-race">{open.ghlError}</p>}
                {open.ghlStatus !== "sent" && (
                  <button onClick={retry} disabled={busy} className="btn btn-outline mt-3 min-h-[38px] px-3 text-xs disabled:opacity-50">
                    {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <RefreshCw className="h-3.5 w-3.5" aria-hidden />} Retry delivery
                  </button>
                )}
                {open.metaStatus && <p className="mt-2 text-xs text-steel">Meta Lead event: {open.metaStatus.replace("_", " ")}</p>}
              </div>
              <NotesBox key={open._id} initial={open.notes} busy={busy} onSave={(notes) => update({ notes })} />
              <button onClick={remove} className="inline-flex items-center gap-1 text-xs font-semibold text-race"><Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete inquiry</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function NotesBox({ initial, busy, onSave }: { initial: string; busy: boolean; onSave: (v: string) => void }) {
  const [v, setV] = useState(initial ?? "");
  return (
    <label className="block">
      <span className="label">Internal notes</span>
      <textarea value={v} onChange={(e) => setV(e.target.value)} rows={3} className="field" />
      <button type="button" disabled={busy || v === (initial ?? "")} onClick={() => onSave(v)} className="btn btn-outline mt-2 min-h-[36px] px-3 text-xs disabled:opacity-40">Save notes</button>
    </label>
  );
}
