"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";
import { CATEGORY_ICONS } from "@/lib/constants";
import AdminImageField from "./AdminImageField";
import { api, ApiError, errMsg } from "./api";
import { IconBtn } from "./ProductsTable";
import { useToast } from "./Toast";
import { Badge, Field, Modal, PageTitle, Toggle } from "./ui";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Doc = { _id: string; isActive: boolean; sortOrder: number } & Record<string, any>;

function useCollection(base: string) {
  const toast = useToast();
  const [items, setItems] = useState<Doc[] | null>(null);
  const load = useCallback(async () => {
    try {
      const res = await api<{ items: Doc[] }>(`${base}?limit=200`);
      setItems(res.items);
    } catch (e) {
      toast.error(errMsg(e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base]);
  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  async function run(fn: () => Promise<unknown>, ok: string) {
    try {
      await fn();
      toast.success(ok);
      await load();
      return true;
    } catch (e) {
      toast.error(errMsg(e));
      return false;
    }
  }
  const toggle = (d: Doc) => run(() => api(`${base}/${d._id}`, { method: "PATCH", body: { isActive: !d.isActive } }), d.isActive ? "Hidden" : "Activated");
  const remove = (d: Doc, label: string) => confirm(`Delete “${label}”?`) && run(() => api(`${base}/${d._id}`, { method: "DELETE" }), "Deleted");
  const move = async (i: number, dir: -1 | 1) => {
    if (!items) return;
    const next = [...items];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
    await run(() => api(`${base}/reorder`, { body: { ids: next.map((x) => x._id) } }), "Order saved");
  };
  return { items, load, run, toggle, remove, move };
}

function useEditor<T>(empty: T) {
  const [editing, setEditing] = useState<{ id?: string; v: T } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  return { editing, setEditing, errors, setErrors, saving, setSaving, openNew: () => { setErrors({}); setEditing({ v: empty }); } };
}

function Reorder({ i, n, onMove, label }: { i: number; n: number; onMove: (i: number, d: -1 | 1) => void; label: string }) {
  return (
    <div className="flex flex-col">
      <button onClick={() => onMove(i, -1)} disabled={i === 0} aria-label={`Move ${label} up`} className="grid h-6 w-8 place-items-center text-steel disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" /></button>
      <button onClick={() => onMove(i, 1)} disabled={i === n - 1} aria-label={`Move ${label} down`} className="grid h-6 w-8 place-items-center text-steel disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" /></button>
    </div>
  );
}

const Loading = () => <div className="py-16 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-steel" aria-label="Loading" /></div>;

async function submit(
  base: string,
  ed: ReturnType<typeof useEditor<any>>,
  body: unknown,
  onDone: () => Promise<void>,
  toast: ReturnType<typeof useToast>
) {
  if (!ed.editing) return;
  ed.setSaving(true);
  ed.setErrors({});
  try {
    await api(ed.editing.id ? `${base}/${ed.editing.id}` : base, { method: ed.editing.id ? "PUT" : "POST", body });
    toast.success("Saved — live site updated");
    ed.setEditing(null);
    await onDone();
  } catch (e) {
    if (e instanceof ApiError) ed.setErrors(e.fields);
    toast.error(errMsg(e));
  } finally {
    ed.setSaving(false);
  }
}

/* ───────────────────────── Categories ───────────────────────── */

type CatInput = { name: string; slug: string; description: string; image: string; icon: string; isActive: boolean; sortOrder: number };
const EMPTY_CAT: CatInput = { name: "", slug: "", description: "", image: "", icon: "sparkles", isActive: true, sortOrder: 0 };

export function CategoriesManager() {
  const base = "/api/admin/categories";
  const c = useCollection(base);
  const ed = useEditor(EMPTY_CAT);
  const toast = useToast();
  const v = ed.editing?.v;
  const set = (k: keyof CatInput, val: unknown) => ed.setEditing((s) => (s ? { ...s, v: { ...s.v, [k]: val } } : s));

  return (
    <div>
      <PageTitle title="Categories" sub="Group products on the Services page.">
        <button onClick={ed.openNew} className="btn btn-red"><Plus className="h-4 w-4" aria-hidden /> New category</button>
      </PageTitle>
      {!c.items ? <Loading /> : (
        <ul className="divide-y divide-cloud border border-cloud bg-white">
          {c.items.map((d, i) => (
            <li key={d._id} className="flex items-center gap-3 px-3 py-2">
              <Reorder i={i} n={c.items!.length} onMove={c.move} label={d.name} />
              <div className="relative h-12 w-20 shrink-0 overflow-hidden bg-cloud"><SafeImage src={d.image} alt="" fill sizes="80px" className="object-cover" /></div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{d.name}</p>
                <p className="truncate text-xs text-steel">/{d.slug} · {d.description}</p>
              </div>
              {d.isActive ? <Badge tone="green">Active</Badge> : <Badge>Hidden</Badge>}
              <IconBtn label={d.isActive ? "Hide" : "Show"} onClick={() => c.toggle(d)}>{d.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</IconBtn>
              <IconBtn label="Edit" onClick={() => { ed.setErrors({}); ed.setEditing({ id: d._id, v: { ...EMPTY_CAT, ...pick(d, Object.keys(EMPTY_CAT)) } }); }}><Pencil className="h-4 w-4" /></IconBtn>
              <IconBtn label="Delete" danger onClick={() => c.remove(d, d.name)}><Trash2 className="h-4 w-4" /></IconBtn>
            </li>
          ))}
        </ul>
      )}
      <Modal open={!!ed.editing} onClose={() => ed.setEditing(null)} title={ed.editing?.id ? "Edit category" : "New category"}>
        {v && (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); submit(base, ed, { ...v, slug: v.slug || undefined }, c.load, toast); }}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name *" error={ed.errors.name}><input value={v.name} onChange={(e) => set("name", e.target.value)} className="field" required /></Field>
              <Field label="Slug" error={ed.errors.slug}><input value={v.slug} onChange={(e) => set("slug", e.target.value)} className="field" /></Field>
            </div>
            <Field label="Description" error={ed.errors.description}><textarea value={v.description} onChange={(e) => set("description", e.target.value)} rows={2} className="field" /></Field>
            <Field label="Icon">
              <select value={v.icon} onChange={(e) => set("icon", e.target.value)} className="field">
                {CATEGORY_ICONS.map((i) => <option key={i}>{i}</option>)}
              </select>
            </Field>
            <AdminImageField folder="products" label="Cover image" value={v.image} onChange={(u) => set("image", u)} />
            <Toggle label="Active" checked={v.isActive} onChange={(x) => set("isActive", x)} />
            <SaveBar saving={ed.saving} onCancel={() => ed.setEditing(null)} />
          </form>
        )}
      </Modal>
    </div>
  );
}

/* ───────────────────────── Offers ───────────────────────── */

type OfferInput = { title: string; slug: string; description: string; image: string; products: string[]; internalNotes: string; isActive: boolean; startsAt: string; endsAt: string; sortOrder: number };
const EMPTY_OFFER: OfferInput = { title: "", slug: "", description: "", image: "", products: [], internalNotes: "", isActive: false, startsAt: "", endsAt: "", sortOrder: 0 };
const day = (d?: string | null) => (d ? new Date(d).toISOString().slice(0, 10) : "");

export function OffersManager({ products }: { products: { id: string; name: string }[] }) {
  const base = "/api/admin/offers";
  const c = useCollection(base);
  const ed = useEditor(EMPTY_OFFER);
  const toast = useToast();
  const v = ed.editing?.v;
  const set = (k: keyof OfferInput, val: unknown) => ed.setEditing((s) => (s ? { ...s, v: { ...s.v, [k]: val } } : s));

  return (
    <div>
      <PageTitle title="Offers" sub="Public copy must not contain prices. Use internal notes for terms.">
        <button onClick={ed.openNew} className="btn btn-red"><Plus className="h-4 w-4" aria-hidden /> New offer</button>
      </PageTitle>
      {!c.items ? <Loading /> : c.items.length === 0 ? <p className="text-sm text-steel">No offers yet.</p> : (
        <ul className="divide-y divide-cloud border border-cloud bg-white">
          {c.items.map((d, i) => (
            <li key={d._id} className="flex items-center gap-3 px-3 py-2">
              <Reorder i={i} n={c.items!.length} onMove={c.move} label={d.title} />
              <div className="relative h-12 w-20 shrink-0 overflow-hidden bg-cloud"><SafeImage src={d.image} alt="" fill sizes="80px" className="object-cover" /></div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{d.title}</p>
                <p className="truncate text-xs text-steel">{d.internalNotes || "—"}{d.endsAt ? ` · ends ${day(d.endsAt)}` : ""}</p>
              </div>
              {d.isActive ? <Badge tone="green">Active</Badge> : <Badge>Off</Badge>}
              <IconBtn label={d.isActive ? "Deactivate" : "Activate"} onClick={() => c.toggle(d)}>{d.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</IconBtn>
              <IconBtn label="Edit" onClick={() => { ed.setErrors({}); ed.setEditing({ id: d._id, v: { ...EMPTY_OFFER, ...pick(d, Object.keys(EMPTY_OFFER)), products: (d.products ?? []).map(String), startsAt: day(d.startsAt), endsAt: day(d.endsAt) } }); }}><Pencil className="h-4 w-4" /></IconBtn>
              <IconBtn label="Duplicate" onClick={() => c.run(() => api(`${base}/${d._id}/duplicate`, { method: "POST" }), "Duplicated")}><Copy className="h-4 w-4" /></IconBtn>
              <IconBtn label="Delete" danger onClick={() => c.remove(d, d.title)}><Trash2 className="h-4 w-4" /></IconBtn>
            </li>
          ))}
        </ul>
      )}
      <Modal wide open={!!ed.editing} onClose={() => ed.setEditing(null)} title={ed.editing?.id ? "Edit offer" : "New offer"}>
        {v && (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); submit(base, ed, { ...v, slug: v.slug || undefined, startsAt: v.startsAt || null, endsAt: v.endsAt || null }, c.load, toast); }}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title * (no prices)" error={ed.errors.title}><input value={v.title} onChange={(e) => set("title", e.target.value)} className="field" required /></Field>
              <Field label="Slug" error={ed.errors.slug}><input value={v.slug} onChange={(e) => set("slug", e.target.value)} className="field" /></Field>
            </div>
            <Field label="Public description (no prices)" error={ed.errors.description} hint="Suggested ending: “Limited-time offer, contact us for details.”"><textarea value={v.description} onChange={(e) => set("description", e.target.value)} rows={3} className="field" /></Field>
            <Field label="Internal notes (admin only)"><textarea value={v.internalNotes} onChange={(e) => set("internalNotes", e.target.value)} rows={2} className="field" /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Starts" error={ed.errors.startsAt}><input type="date" value={v.startsAt} onChange={(e) => set("startsAt", e.target.value)} className="field" /></Field>
              <Field label="Ends" error={ed.errors.endsAt}><input type="date" value={v.endsAt} onChange={(e) => set("endsAt", e.target.value)} className="field" /></Field>
            </div>
            <Field label="Linked products">
              <select multiple value={v.products} onChange={(e) => set("products", [...e.target.selectedOptions].map((o) => o.value))} className="field h-40">
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Field>
            <AdminImageField folder="misc" label="Image" value={v.image} onChange={(u) => set("image", u)} />
            <Toggle label="Active" checked={v.isActive} onChange={(x) => set("isActive", x)} />
            <SaveBar saving={ed.saving} onCancel={() => ed.setEditing(null)} />
          </form>
        )}
      </Modal>
    </div>
  );
}

/* ───────────────────────── Gallery ───────────────────────── */

type GalInput = { image: string; alt: string; caption: string; category: string; isActive: boolean; sortOrder: number };
const EMPTY_GAL: GalInput = { image: "", alt: "", caption: "", category: "General", isActive: true, sortOrder: 0 };

export function GalleryManager() {
  const base = "/api/admin/gallery";
  const c = useCollection(base);
  const ed = useEditor(EMPTY_GAL);
  const toast = useToast();
  const [filter, setFilter] = useState("");
  const v = ed.editing?.v;
  const set = (k: keyof GalInput, val: unknown) => ed.setEditing((s) => (s ? { ...s, v: { ...s.v, [k]: val } } : s));
  const cats = [...new Set((c.items ?? []).map((d) => d.category as string))];
  const shown = (c.items ?? []).filter((d) => !filter || d.category === filter);

  return (
    <div>
      <PageTitle title="Gallery" sub="Photos on the public Gallery page.">
        <button onClick={ed.openNew} className="btn btn-red"><Plus className="h-4 w-4" aria-hidden /> Add photo</button>
      </PageTitle>
      {cats.length > 1 && (
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="field mb-4 max-w-xs" aria-label="Filter by category">
          <option value="">All categories</option>
          {cats.map((x) => <option key={x}>{x}</option>)}
        </select>
      )}
      {!c.items ? <Loading /> : shown.length === 0 ? <p className="text-sm text-steel">No photos yet.</p> : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((d) => {
            const i = c.items!.indexOf(d);
            return (
              <li key={d._id} className="border border-cloud bg-white">
                <div className="relative aspect-[4/3] bg-cloud"><SafeImage src={d.image} alt={d.alt} fill sizes="300px" className="object-cover" /></div>
                <div className="flex items-center gap-1 p-2">
                  <Reorder i={i} n={c.items!.length} onMove={c.move} label={d.caption || "photo"} />
                  <div className="min-w-0 flex-1 text-xs">
                    <p className="truncate font-semibold text-ink">{d.caption || "No caption"}</p>
                    <p className="text-steel">{d.category}{d.isActive ? "" : " · hidden"}</p>
                  </div>
                  <IconBtn label="Edit" onClick={() => { ed.setErrors({}); ed.setEditing({ id: d._id, v: { ...EMPTY_GAL, ...pick(d, Object.keys(EMPTY_GAL)) } }); }}><Pencil className="h-4 w-4" /></IconBtn>
                  <IconBtn label="Delete" danger onClick={() => c.remove(d, d.caption || "photo")}><Trash2 className="h-4 w-4" /></IconBtn>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <Modal open={!!ed.editing} onClose={() => ed.setEditing(null)} title={ed.editing?.id ? "Edit photo" : "Add photo"}>
        {v && (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); submit(base, ed, v, c.load, toast); }}>
            <AdminImageField folder="gallery" label="Photo *" value={v.image} onChange={(u) => set("image", u)} />
            {ed.errors.image && <p className="text-xs text-race">{ed.errors.image}</p>}
            <Field label="Alt text" hint="Describe the photo for screen readers"><input value={v.alt} onChange={(e) => set("alt", e.target.value)} className="field" /></Field>
            <Field label="Caption" error={ed.errors.caption}><input value={v.caption} onChange={(e) => set("caption", e.target.value)} className="field" /></Field>
            <Field label="Category"><input value={v.category} onChange={(e) => set("category", e.target.value)} className="field" list="gal-cats" /></Field>
            <datalist id="gal-cats">{["Tint", "PPF", "Ceramic Coating", "Dashcams", "Lighting", "Exterior", "Tires", ...cats].map((x) => <option key={x} value={x} />)}</datalist>
            <Toggle label="Visible" checked={v.isActive} onChange={(x) => set("isActive", x)} />
            <SaveBar saving={ed.saving} onCancel={() => ed.setEditing(null)} />
          </form>
        )}
      </Modal>
    </div>
  );
}

function SaveBar({ saving, onCancel }: { saving: boolean; onCancel: () => void }) {
  return (
    <div className="flex justify-end gap-2 border-t border-cloud pt-4">
      <button type="button" onClick={onCancel} className="btn btn-outline">Cancel</button>
      <button disabled={saving} className="btn btn-red disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Save</button>
    </div>
  );
}

function pick(d: Doc, keys: string[]) {
  return Object.fromEntries(keys.filter((k) => d[k] !== undefined && d[k] !== null).map((k) => [k, d[k]]));
}
