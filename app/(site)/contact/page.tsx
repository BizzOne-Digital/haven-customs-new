import type { Metadata } from "next";
import { Clock, Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import PageHero from "@/components/site/PageHero";
import QuoteForm from "@/components/site/QuoteForm";
import { NOT_OFFERED } from "@/lib/constants";
import { getActiveProductOptions, getPage, getSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Contact & Quotes",
  description: "Request a quote for tint, PPF, dashcams, CarPlay, lighting or tire services. 124 Production Dr, Scarborough. Call +1 416-431-5255.",
  alternates: { canonical: "/contact" },
};

type SP = Promise<{ service?: string | string[] }>;

export default async function ContactPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const pre = (Array.isArray(sp.service) ? sp.service : (sp.service ?? "").split(",")).filter(Boolean).slice(0, 10);
  const [page, s, options] = await Promise.all([getPage("contact"), getSettings(), getActiveProductOptions()]);

  return (
    <>
      <PageHero eyebrow="Contact us" heading={page.heading} accent={page.headingAccent} intro={page.intro} />
      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto grid max-w-[1320px] gap-12 px-4 sm:px-6 lg:grid-cols-[1.25fr_0.75fr] lg:px-10">
          <div id="quote">
            <h2 className="heading text-3xl">Request a quote</h2>
            <p className="mb-6 mt-2 text-sm text-steel">Fields marked * are required.</p>
            {options.length > 0 ? (
              <QuoteForm options={options} preselected={pre} />
            ) : (
              // Catalog unavailable (e.g. database offline) — don't show a form that can't be submitted.
              <div className="border-l-2 border-race bg-pearl p-6 text-sm text-graphite">
                <p className="font-semibold text-ink">Online quote requests are temporarily unavailable.</p>
                <p className="mt-2">Please call the shop and our team will help you right away.</p>
                <a href={s.phoneHref} className="btn btn-red mt-4">
                  <Phone className="h-4 w-4" aria-hidden /> Call {s.phone}
                </a>
              </div>
            )}
          </div>
          <aside data-reveal="right" className="space-y-8">
            <div className="border border-cloud bg-pearl p-6">
              <h2 className="heading text-2xl">Visit the shop</h2>
              <ul className="mt-5 space-y-4 text-sm text-graphite">
                <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-race" aria-hidden /> {s.address}</li>
                <li>
                  <a href={s.phoneHref} className="flex gap-3 font-semibold text-ink hover:text-race">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-race" aria-hidden /> {s.phone}
                  </a>
                </li>
                {s.email && (
                  <li>
                    <a href={`mailto:${s.email}`} className="flex gap-3 hover:text-race">
                      <Mail className="mt-0.5 h-4 w-4 shrink-0 text-race" aria-hidden /> {s.email}
                    </a>
                  </li>
                )}
                <li className="flex gap-3"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-race" aria-hidden /> {s.hours}</li>
              </ul>
              <div className="mt-5 flex gap-4">
                {s.instagram && <a href={s.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-ink hover:text-race"><Instagram className="h-5 w-5" aria-hidden /></a>}
                {s.facebook && <a href={s.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-ink hover:text-race"><Facebook className="h-5 w-5" aria-hidden /></a>}
              </div>
            </div>
            {s.mapEmbedUrl && (
              <div className="relative aspect-[4/3] overflow-hidden border border-cloud">
                <iframe title="Map to Haven Customs" src={s.mapEmbedUrl} className="absolute inset-0 h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            )}
            <div className="text-sm text-steel">
              <p className="font-semibold text-ink">Services we don&apos;t offer</p>
              <p className="mt-1 leading-relaxed">{NOT_OFFERED.join(", ")}.</p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
