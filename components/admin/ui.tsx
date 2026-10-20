"use client";

import { Plus, Trash2, X } from "lucide-react";
import { useEffect, useRef } from "react";

export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-steel">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-race">{error}</span>}
    </label>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-race" : "bg-mist"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`} />
      </button>
      {label}
    </label>
  );
}

/** Editable list of short strings (features, options). */
export function ListEditor({ value, onChange, placeholder, label }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string; label: string }) {
  return (
    <div>
      <span className="label">{label}</span>
      <ul className="space-y-2">
        {value.map((v, i) => (
          <li key={i} className="flex gap-2">
            <input
              value={v}
              onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))}
              className="field"
              aria-label={`${label} ${i + 1}`}
            />
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Remove ${label} ${i + 1}`} className="grid w-11 shrink-0 place-items-center border border-mist text-steel hover:text-race">
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => onChange([...value, ""])} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-race">
        <Plus className="h-3.5 w-3.5" aria-hidden /> Add {placeholder ?? "item"}
      </button>
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} onClose={onClose} className={`m-auto max-h-[92vh] overflow-y-auto rounded-[3px] bg-white p-0 shadow-2xl backdrop:bg-ink/50`} style={{ width: `min(96vw, ${wide ? 900 : 640}px)` }}>
      {open && (
        <div>
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-mist bg-white px-6 py-4">
            <h2 className="heading text-2xl">{title}</h2>
            <button type="button" onClick={onClose} aria-label="Close" className="grid h-10 w-10 place-items-center hover:bg-pearl"><X className="h-5 w-5" aria-hidden /></button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      )}
    </dialog>
  );
}

export function PageTitle({ title, children, sub }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="heading text-4xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-steel">{sub}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function Badge({ tone = "gray", children }: { tone?: "gray" | "red" | "green" | "amber"; children: React.ReactNode }) {
  const cls = {
    gray: "bg-cloud text-graphite",
    red: "bg-race/10 text-race",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  }[tone];
  return <span className={`inline-flex items-center px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wide ${cls}`}>{children}</span>;
}

export function Pager({ page, total, limit, onPage }: { page: number; total: number; limit: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-steel">
      <span>Page {page} of {pages} · {total} total</span>
      <div className="flex gap-2">
        <button disabled={page <= 1} onClick={() => onPage(page - 1)} className="btn btn-outline min-h-[36px] px-3 py-1 text-xs disabled:opacity-40">Previous</button>
        <button disabled={page >= pages} onClick={() => onPage(page + 1)} className="btn btn-outline min-h-[36px] px-3 py-1 text-xs disabled:opacity-40">Next</button>
      </div>
    </div>
  );
}
