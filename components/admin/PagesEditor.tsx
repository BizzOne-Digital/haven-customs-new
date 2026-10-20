"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, RotateCcw, Trash2 } from "lucide-react";
import AdminImageField from "./AdminImageField";
import { api, ApiError, errMsg } from "./api";
import { useToast } from "./Toast";
import { Field, PageTitle, Toggle } from "./ui";

/* eslint-disable @typescript-eslint/no-explicit-any */
const TABS = [
  { key: "home", label: "Homepage" },
  { key: "about", label: "About" },
  { key: "contact", label: "Contact" },
  { key: "booking", label: "Booking" },
  { key: "reviews", label: "Reviews" },
] as const;

const human = (k: string) => k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

export default function PagesEditor() {
  const toast = useToast();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("home");
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [defaults, setDefaults] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function switchTab(key: typeof tab) {
    if (key === tab) return;
    setData(null);
    setErrors({});
    setTab(key);
  }

  useEffect(() => {
    api<{ data: any; defaults: any }>(`/api/admin/pages/${tab}`)
      .then((r) => { setData(r.data); setDefaults(r.defaults); })
      .catch((e) => toast.error(errMsg(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const set = (k: string, v: unknown) => setData((d) => ({ ...d!, [k]: v }));

  async function save() {
    if (!data) return;
    setSaving(true);
    setErrors({});
    try {
      const r = await api<{ data: any }>(`/api/admin/pages/${tab}`, { method: "PUT", body: data });
      setData(r.data);
      toast.success("Page saved — live site updated");
    } catch (e) {
      if (e instanceof ApiError) setErrors(e.fields);
      toast.error(errMsg(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageTitle title="Pages" sub="Edit headings, copy and images. Layout and styling stay as designed.">
        <button onClick={save} disabled={saving || !data} className="btn btn-red disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Save page</button>
      </PageTitle>
      <div role="tablist" className="mb-6 flex flex-wrap gap-1 border-b border-cloud">
        {TABS.map((t) => (
          <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => switchTab(t.key)} className={`min-h-[42px] px-4 text-sm font-semibold ${tab === t.key ? "border-b-2 border-race text-race" : "text-steel hover:text-ink"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {!data ? (
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-steel" aria-label="Loading" />
      ) : (
        <div className="max-w-3xl space-y-5 border border-cloud bg-white p-6">
          {Object.entries(defaults).map(([k, def]) => {
            const val = data[k];
            const reset = val !== def && typeof def === "string" && (
              <button type="button" onClick={() => set(k, def)} className="ml-2 inline-flex items-center gap-1 text-[0.7rem] font-semibold text-steel hover:text-race"><RotateCcw className="h-3 w-3" aria-hidden /> Reset</button>
            );
            if (k === "heroImageMode")
              return (
                <Field key={k} label="Hero image style" hint="Use “cutout” only for a transparent PNG of a top-down car.">
                  <select value={val} onChange={(e) => set(k, e.target.value)} className="field">
                    <option value="photo">Framed photo</option>
                    <option value="cutout">Transparent cutout over the headline</option>
                  </select>
                </Field>
              );
            if (/image$/i.test(k) && typeof def === "string")
              return (
                <div key={k}>
                  <AdminImageField folder="pages" label={human(k)} value={val ?? ""} onChange={(u) => set(k, u)} />
                  {errors[k] && <p className="mt-1 text-xs text-race">{errors[k]}</p>}
                  {reset}
                </div>
              );
            if (typeof def === "string") {
              const long = def.length > 70 || def.includes("\n");
              return (
                <Field key={k} label={human(k)} error={errors[k]}>
                  {long ? <textarea value={val ?? ""} onChange={(e) => set(k, e.target.value)} rows={3} className="field" /> : <input value={val ?? ""} onChange={(e) => set(k, e.target.value)} className="field" />}
                  {reset}
                </Field>
              );
            }
            if (k === "values") return <ValuesEditor key={k} value={val ?? []} onChange={(v) => set(k, v)} />;
            if (k === "items") return <ReviewsEditor key={k} value={val ?? []} onChange={(v) => set(k, v)} />;
            return null;
          })}
        </div>
      )}
    </div>
  );
}

function ValuesEditor({ value, onChange }: { value: { title: string; text: string }[]; onChange: (v: any[]) => void }) {
  return (
    <div>
      <span className="label">Values</span>
      {value.map((v, i) => (
        <div key={i} className="mb-3 grid gap-2 border-b border-cloud pb-3">
          <input value={v.title} onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} className="field" placeholder="Title" aria-label={`Value ${i + 1} title`} />
          <textarea value={v.text} onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))} className="field" rows={2} aria-label={`Value ${i + 1} text`} />
          <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="justify-self-start text-xs font-semibold text-race">Remove</button>
        </div>
      ))}
      {value.length < 6 && <button type="button" onClick={() => onChange([...value, { title: "", text: "" }])} className="inline-flex items-center gap-1 text-sm font-semibold text-race"><Plus className="h-4 w-4" aria-hidden /> Add value</button>}
    </div>
  );
}

function ReviewsEditor({ value, onChange }: { value: { name: string; text: string; service?: string; approved: boolean }[]; onChange: (v: any[]) => void }) {
  return (
    <div>
      <span className="label">Customer reviews</span>
      <p className="mb-3 text-xs text-steel">Only add genuine reviews with the customer&apos;s permission. Approved reviews appear on the homepage; the section stays hidden when none are approved.</p>
      {value.map((r, i) => {
        const upd = (patch: object) => onChange(value.map((x, j) => (j === i ? { ...x, ...patch } : x)));
        return (
          <div key={i} className="mb-4 grid gap-2 border-b border-cloud pb-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <input value={r.name} onChange={(e) => upd({ name: e.target.value })} className="field" placeholder="Customer name" aria-label="Customer name" />
              <input value={r.service ?? ""} onChange={(e) => upd({ service: e.target.value })} className="field" placeholder="Service (optional)" aria-label="Service" />
            </div>
            <textarea value={r.text} onChange={(e) => upd({ text: e.target.value })} className="field" rows={3} placeholder="Review text" aria-label="Review text" />
            <div className="flex items-center justify-between">
              <Toggle label="Approved" checked={r.approved} onChange={(approved) => upd({ approved })} />
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Remove review" className="text-race"><Trash2 className="h-4 w-4" aria-hidden /></button>
            </div>
          </div>
        );
      })}
      <button type="button" onClick={() => onChange([...value, { name: "", text: "", service: "", approved: false }])} className="inline-flex items-center gap-1 text-sm font-semibold text-race"><Plus className="h-4 w-4" aria-hidden /> Add review</button>
    </div>
  );
}
