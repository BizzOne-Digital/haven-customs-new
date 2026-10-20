"use client";

import { useState } from "react";
import SafeImage from "@/components/ui/SafeImage";
import type { PublicGalleryItem } from "@/lib/queries";

export default function GalleryGrid({ items }: { items: PublicGalleryItem[] }) {
  const cats = ["All", ...new Set(items.map((i) => i.category))];
  const [cat, setCat] = useState("All");
  const shown = cat === "All" ? items : items.filter((i) => i.category === cat);
  return (
    <>
      {cats.length > 2 && (
        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter gallery">
          {cats.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={cat === c}
              onClick={() => setCat(c)}
              className={`min-h-[40px] border px-3.5 text-xs font-semibold uppercase tracking-[0.12em] ${cat === c ? "border-race bg-race text-white" : "border-mist text-ink hover:border-ink"}`}
            >
              {c}
            </button>
          ))}
        </div>
      )}
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((g) => (
          <li key={g.id}>
            <figure>
              <div className="relative aspect-[4/3] overflow-hidden bg-cloud">
                <SafeImage src={g.image} alt={g.alt || g.caption || "Haven Customs work"} fill sizes="(min-width:1024px) 400px, (min-width:640px) 50vw, 100vw" className="object-cover" />
              </div>
              {g.caption && <figcaption className="mt-2 text-sm text-steel">{g.caption}</figcaption>}
            </figure>
          </li>
        ))}
      </ul>
    </>
  );
}
