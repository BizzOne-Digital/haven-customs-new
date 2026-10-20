import Link from "next/link";
import { CalendarClock } from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";
import Arrow from "./Arrow";
import type { PublicProduct } from "@/lib/queries";

export default function ServiceCard({ p }: { p: PublicProduct }) {
  const img = p.images[0];
  return (
    <Link href={`/services/${p.slug}`} className="group flex h-full flex-col border border-cloud bg-white transition-colors hover:border-silver">
      <div className="relative aspect-[16/9] overflow-hidden bg-cloud">
        <SafeImage
          src={img?.url}
          alt={img?.alt || p.name}
          fill
          sizes="(min-width:1024px) 400px, (min-width:640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          fallbackLabel={p.name}
        />
        {p.category && (
          <span className="absolute left-3 top-3 bg-white/95 px-2 py-1 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-ink">
            {p.category.name}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-cond text-xl font-bold leading-tight text-ink">{p.name}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-steel">{p.shortDescription}</p>
        {p.bookingNote && (
          <p className="mt-3 flex items-start gap-2 text-xs font-medium text-race">
            <CalendarClock className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden /> {p.bookingNote}
          </p>
        )}
        <span className="link-arrow mt-auto pt-4">
          View details <Arrow />
        </span>
      </div>
    </Link>
  );
}
