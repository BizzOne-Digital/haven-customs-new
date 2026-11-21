"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { VEHICLE_TYPES } from "@/lib/constants";

type Cat = { slug: string; name: string };

/** Filter state lives in the URL (?q, ?category, ?vehicle) so results are shareable and server-rendered. */
export default function ServiceFilters({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");

  const urlCats = params.get("category") ?? "";
  // Optimistic selection: the tab turns red on click, before the new results arrive.
  const [pendingCats, setPendingCats] = useState<string | null>(null);
  const [lastUrlCats, setLastUrlCats] = useState(urlCats);
  if (lastUrlCats !== urlCats) {
    setLastUrlCats(urlCats);
    setPendingCats(null);
  }
  const selected = (pendingCats ?? urlCats).split(",").filter(Boolean);
  const vehicle = params.get("vehicle") ?? "";

  function push(next: { q?: string; category?: string[]; vehicle?: string }) {
    const sp = new URLSearchParams(params.toString());
    const set = (k: string, v?: string) => (v ? sp.set(k, v) : sp.delete(k));
    if ("q" in next) set("q", next.q?.trim());
    if ("category" in next) {
      set("category", next.category?.join(","));
      setPendingCats(next.category?.join(",") ?? "");
    }
    if ("vehicle" in next) set("vehicle", next.vehicle);
    startTransition(() => router.replace(`${pathname}${sp.size ? `?${sp}` : ""}`, { scroll: false }));
  }

  useEffect(() => {
    const t = setTimeout(() => {
      if ((params.get("q") ?? "") !== q) push({ q });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // Tabs are single-select: a tab shows only its category; clicking the active tab returns to All.
  // (Links such as ?category=tires,repairs can still pre-select several.)
  const selectCat = (slug: string) => push({ category: selected.length === 1 && selected[0] === slug ? [] : [slug] });
  const tabCls = (on: boolean) =>
    `min-h-[40px] rounded-[2px] border px-3.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors ${
      on ? "border-race bg-race text-white" : "border-mist bg-white text-ink hover:border-ink"
    }`;
  const active = selected.length > 0 || !!vehicle || !!params.get("q");

  return (
    <div className="flex flex-col gap-5" aria-busy={pending} data-filters-pending={pending || undefined}>
      <div className="flex flex-col gap-3 md:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search services</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tint, dashcam, PPF, tires…"
            className="field pl-10!"
          />
        </label>
        <label className="md:w-64">
          <span className="sr-only">Vehicle type</span>
          <select value={vehicle} onChange={(e) => push({ vehicle: e.target.value })} className="field">
            <option value="">All vehicle types</option>
            {VEHICLE_TYPES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by category">
        <button type="button" aria-pressed={selected.length === 0} onClick={() => push({ category: [] })} className={tabCls(selected.length === 0)}>
          All
        </button>
        {categories.map((c) => {
          const on = selected.includes(c.slug);
          return (
            <button
              key={c.slug}
              type="button"
              aria-pressed={on}
              onClick={() => selectCat(c.slug)}
              className={tabCls(on)}
            >
              {c.name}
            </button>
          );
        })}
        {active && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              startTransition(() => router.replace(pathname, { scroll: false }));
            }}
            className="inline-flex min-h-[40px] items-center gap-1 px-2 text-xs font-semibold text-steel hover:text-race"
          >
            <X className="h-3.5 w-3.5" aria-hidden /> Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
