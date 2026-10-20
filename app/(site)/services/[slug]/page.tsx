import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, CalendarClock, Car, ChevronRight, ShieldCheck, Tag } from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";
import Arrow from "@/components/site/Arrow";
import BookButton from "@/components/site/BookButton";
import ServiceCard from "@/components/site/ServiceCard";
import { getProductBySlug, getRelatedProducts, getSettings } from "@/lib/queries";
import { serviceJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";
type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await getProductBySlug((await params).slug).catch(() => null);
  if (!p) return { title: "Service not found" };
  return {
    title: `${p.name}${p.category ? ` — ${p.category.name}` : ""}`,
    description: p.shortDescription || `${p.name} at Haven Customs, Scarborough.`,
    alternates: { canonical: `/services/${p.slug}` },
    openGraph: { title: p.name, description: p.shortDescription, images: p.images[0]?.url.startsWith("/uploads/") ? [] : p.images.slice(0, 1).map((i) => i.url) },
  };
}

const GENERAL_FAQ = [
  { q: "How much does it cost?", a: "Pricing depends on your vehicle and the options you choose. Send us a quote request or call the shop and our team will give you exact details." },
  { q: "How do I book?", a: "Use the Book Appointment button to pick a time, or send a quote request and we'll contact you to schedule." },
];

export default async function ServiceDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) notFound();
  const [related, settings] = await Promise.all([getRelatedProducts(p), getSettings()]);
  const isPpf = /ppf/i.test(p.slug);
  const faqs = [...p.faqs, ...GENERAL_FAQ];
  const [cover, ...more] = p.images;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd(p)) }} />
      <section className="relative overflow-hidden bg-[linear-gradient(100deg,#ffffff_0%,#f1f1f2_60%,#e7e8ea_100%)]">
        <div aria-hidden className="diag-accent pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid max-w-[1320px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:px-10 lg:py-14">
          <div>
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs font-medium text-steel">
              <Link href="/services" className="hover:text-race">Services</Link>
              {p.category && (
                <>
                  <ChevronRight className="h-3 w-3" aria-hidden />
                  <Link href={`/services?category=${p.category.slug}`} className="hover:text-race">{p.category.name}</Link>
                </>
              )}
            </nav>
            <h1 className="display mt-4 text-[clamp(2.8rem,7vw,5.5rem)] text-ink">{p.name}</h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-graphite">{p.shortDescription}</p>
            {p.bookingNote && (
              <p className="mt-4 flex items-start gap-2 border-l-2 border-race bg-white px-4 py-3 text-sm font-medium text-ink">
                <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-race" aria-hidden /> {p.bookingNote}
              </p>
            )}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href={`/contact?service=${p.slug}`} className="btn btn-red px-7">
                Get a Quote <Arrow />
              </Link>
              <BookButton
                className="btn btn-black px-7"
                ctx={{ slug: p.slug, name: p.name, calendarKey: p.calendarKey, note: p.bookingNote }}
              />
            </div>
            {isPpf && (
              <p className="mt-4 text-sm text-steel">
                Share your vehicle type and contact number — our shop team will call you with an exact quote.
              </p>
            )}
          </div>
          <div className="relative aspect-[4/3] overflow-hidden bg-cloud lg:[clip-path:polygon(8%_0,100%_0,100%_100%,0_100%)]">
            <SafeImage src={cover?.url} alt={cover?.alt || p.name} fill priority sizes="(min-width:1024px) 600px, 100vw" className="object-cover" fallbackLabel={p.name} />
          </div>
        </div>
      </section>

      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto grid max-w-[1320px] gap-12 px-4 sm:px-6 lg:grid-cols-[1.4fr_0.8fr] lg:px-10">
          <div>
            <h2 className="heading text-3xl">About this service</h2>
            <div className="mt-4 space-y-4 whitespace-pre-line text-[0.98rem] leading-relaxed text-graphite">{p.longDescription}</div>

            {p.features.length > 0 && (
              <>
                <h2 className="heading mt-10 text-3xl">What&apos;s included</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-ink">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-race" aria-hidden /> {f}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {p.options.length > 0 && (
              <>
                <h2 className="heading mt-10 text-3xl">Options</h2>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {p.options.map((o) => (
                    <li key={o} className="border border-mist px-3 py-2 text-sm text-ink">{o}</li>
                  ))}
                </ul>
              </>
            )}

            {more.length > 0 && (
              <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {more.map((img) => (
                  <li key={img.url} className="relative aspect-[4/3] overflow-hidden bg-cloud">
                    <SafeImage src={img.url} alt={img.alt || p.name} fill sizes="(min-width:640px) 260px, 50vw" className="object-cover" />
                  </li>
                ))}
              </ul>
            )}

            <h2 className="heading mt-12 text-3xl">FAQ</h2>
            <div className="mt-4 divide-y divide-cloud border-y border-cloud">
              {faqs.map((f) => (
                <details key={f.q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[0.98rem] font-semibold text-ink">
                    {f.q}
                    <ChevronRight className="h-4 w-4 shrink-0 text-race transition-transform group-open:rotate-90" aria-hidden />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-graphite">{f.a}</p>
                </details>
              ))}
            </div>
          </div>

          <aside className="h-fit border border-cloud bg-pearl p-6 lg:sticky lg:top-28">
            <h2 className="heading text-2xl">Details</h2>
            <dl className="mt-5 space-y-4 text-sm">
              {p.category && (
                <div className="flex gap-3">
                  <Tag className="mt-0.5 h-4 w-4 shrink-0 text-race" aria-hidden />
                  <div><dt className="font-semibold text-ink">Category</dt><dd className="text-graphite">{p.category.name}</dd></div>
                </div>
              )}
              {p.vehicleTypes.length > 0 && (
                <div className="flex gap-3">
                  <Car className="mt-0.5 h-4 w-4 shrink-0 text-race" aria-hidden />
                  <div><dt className="font-semibold text-ink">Vehicle types</dt><dd className="text-graphite">{p.vehicleTypes.join(" · ")}</dd></div>
                </div>
              )}
              {p.brand && (
                <div className="flex gap-3">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-race" aria-hidden />
                  <div><dt className="font-semibold text-ink">Brand</dt><dd className="text-graphite">{p.brand}</dd></div>
                </div>
              )}
              {p.warranty && (
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-race" aria-hidden />
                  <div><dt className="font-semibold text-ink">Warranty</dt><dd className="text-graphite">{p.warranty}</dd></div>
                </div>
              )}
              {p.bookingNote && (
                <div className="flex gap-3">
                  <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-race" aria-hidden />
                  <div><dt className="font-semibold text-ink">Booking</dt><dd className="text-graphite">{p.bookingNote}</dd></div>
                </div>
              )}
            </dl>
            <div className="mt-6 flex flex-col gap-3">
              <Link href={`/contact?service=${p.slug}`} className="btn btn-red w-full">Get a Quote <Arrow /></Link>
              <a href={settings.phoneHref} className="btn btn-outline w-full">Call {settings.phone}</a>
            </div>
            {p.warranty && (
              <p className="mt-4 text-xs leading-relaxed text-steel">
                Warranty claims require the original receipt. Our front desk can confirm full warranty terms.
              </p>
            )}
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-cloud bg-white py-12 lg:py-16">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-10">
            <div className="flex items-end justify-between gap-4">
              <h2 className="heading text-3xl">Related services</h2>
              {p.category && (
                <Link href={`/services?category=${p.category.slug}`} className="link-arrow">View all <Arrow /></Link>
              )}
            </div>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <li key={r.slug}><ServiceCard p={r} /></li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
