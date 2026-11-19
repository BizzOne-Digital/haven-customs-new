import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, CheckCircle2, ChevronDown, Clock, MapPin, Phone } from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";
import Arrow from "@/components/site/Arrow";
import BookButton from "@/components/site/BookButton";
import ServiceCard from "@/components/site/ServiceCard";
import { getProducts, getSettings } from "@/lib/queries";
import { IMG } from "@/lib/images";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

/* Landing page for Google Ads tire keywords: tire installation (near me), tyre installation,
   tires and installation, same day tire installation. Copy is written naturally — no stuffing,
   and no promise of same-day service (availability is confirmed by phone). */

export const metadata: Metadata = {
  title: { absolute: "Tire Installation Near Me in Scarborough | Haven Customs" },
  description:
    "Tire installation in Scarborough for cars, SUVs, trucks and vans: seasonal swaps, mounting and balancing. Ask about same-day tire installation.",
  alternates: { canonical: "/tire-installation" },
  openGraph: {
    title: "Tire Installation in Scarborough",
    description: "Seasonal tire swaps, tire mounting and balancing. Call or book online.",
    url: "/tire-installation",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
};

const FAQS = [
  {
    q: "Where can I get tire installation near me in Scarborough?",
    a: "Haven Customs is at 124 Production Dr, Scarborough, ON M1H 2X8, open Monday to Sunday, 11 AM – 8 PM. Book online or call the shop to arrange your tire installation.",
  },
  {
    q: "Do you offer same-day tire installation?",
    a: "Often, yes — it depends on how busy the shop is that day. Call us and our team will confirm same-day tire installation availability for your vehicle.",
  },
  {
    q: "Can I bring my own tires for installation?",
    a: "Yes. If your tires are already on rims we do a quick seasonal swap; if they're not on rims we mount and balance them for you.",
  },
  {
    q: "Looking for tires and installation near me — do you sell tires too?",
    a: "Call us with your vehicle and tire size and our team will go through your tire and installation options.",
  },
  {
    q: "Is tire installation the same as tyre installation?",
    a: "Yes — tire and tyre are the same thing, just different spellings. Our tyre installation service covers sedans, SUVs, trucks and vans.",
  },
  {
    q: "Is balancing included?",
    a: "Balancing is included with a tire change (tires not on rims). For a swap (tires already on rims), balancing is available as an add-on.",
  },
];

export default async function TireInstallationPage() {
  const [tires, s] = await Promise.all([getProducts({ categories: ["tires"] }), getSettings()]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: "Tire Installation",
        serviceType: "Tire installation",
        url: `${siteUrl()}/tire-installation`,
        areaServed: { "@type": "City", name: "Scarborough, ON" },
        provider: { "@type": "AutoPartsStore", name: "Haven Customs", telephone: s.phone, url: siteUrl() },
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[linear-gradient(100deg,#ffffff_0%,#f1f1f2_60%,#e7e8ea_100%)]">
        <div aria-hidden className="diag-accent pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid max-w-[1320px] items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-16">
          <div>
            <p className="eyebrow">Tire installation · Scarborough</p>
            <h1 className="display mt-3 text-[clamp(3rem,7.5vw,6rem)] text-ink">
              Tire Installation <span className="text-race">Near You.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-graphite">
              Professional tire installation for sedans, SUVs, trucks and vans — seasonal tire swaps, mounting new tires on your rims, and
              balancing. Ask about same-day tire installation when you call.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <BookButton className="btn btn-red px-8" />
              <a href={s.phoneHref} className="btn btn-outline px-8">
                <Phone className="h-4 w-4" aria-hidden /> Call {s.phone}
              </a>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-graphite">
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-race" aria-hidden /> {s.addressLine1}, {s.addressLine2}</li>
              <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-race" aria-hidden /> {s.hours}</li>
            </ul>
          </div>
          <div data-reveal="zoom" className="relative aspect-[4/3] overflow-hidden bg-cloud lg:[clip-path:polygon(8%_0,100%_0,100%_100%,0_100%)]">
            <SafeImage src={IMG.tire} alt="Technician performing a tire installation" fill priority sizes="(min-width:1024px) 560px, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Options */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-10">
          <p className="eyebrow">Your options</p>
          <h2 className="heading mt-3 text-[clamp(2.4rem,5vw,3.8rem)]">
            TIRES AND <span className="text-race">INSTALLATION.</span>
          </h2>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Seasonal tire swap",
                text: "Your winter or summer tires are already on rims? We swap the wheels quickly — balancing available as an add-on.",
              },
              {
                title: "New tire installation",
                text: "Tires not on rims yet? We mount them onto your rims, balance them and install them on your vehicle.",
              },
              {
                title: "Tires and installation",
                text: "Need new tires as well? Call us with your vehicle and tire size and our team will go through your options.",
              },
            ].map((o) => (
              <li key={o.title} className="border-t-2 border-race bg-pearl p-6">
                <CheckCircle2 className="h-6 w-6 text-race" aria-hidden />
                <h3 className="font-cond mt-4 text-xl font-bold text-ink">{o.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-graphite">{o.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Tire services */}
      {tires.length > 0 && (
        <section className="bg-pearl py-14 lg:py-20">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="eyebrow">Tire services</p>
                <h2 className="heading mt-3 text-[clamp(2.4rem,5vw,3.8rem)]">
                  EVERYTHING FOR YOUR <span className="text-race">TIRES.</span>
                </h2>
              </div>
              <Link href="/services?category=tires,repairs" className="link-arrow text-ink hover:text-race">
                Tire repairs too <Arrow className="h-4 w-4 text-race" />
              </Link>
            </div>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tires.map((p) => (
                <li key={p.slug}>
                  <ServiceCard p={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Same day */}
      <section className="relative overflow-hidden bg-ink py-14 text-white lg:py-16">
        <div aria-hidden className="absolute -right-32 top-0 h-full w-1/2 -skew-x-[24deg] bg-white/[0.04]" />
        <div className="relative mx-auto flex max-w-[1320px] flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div>
            <p className="eyebrow">Need it today?</p>
            <h2 className="display mt-3 text-[clamp(2.4rem,5.5vw,4rem)]">
              SAME-DAY TIRE <span className="text-race">INSTALLATION.</span>
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75">
              Looking for same-day tire installation near you? Call the shop and our team will check today&apos;s availability for your vehicle.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href={s.phoneHref} className="btn btn-red px-8">
              <Phone className="h-4 w-4" aria-hidden /> Call {s.phone}
            </a>
            <BookButton className="btn btn-white px-8 text-ink!">
              <CalendarCheck className="h-4 w-4" aria-hidden /> Book online
            </BookButton>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
          <div>
            <p className="eyebrow">Questions</p>
            <h2 className="heading mt-3 text-[clamp(2.4rem,5vw,3.8rem)]">
              TIRE INSTALLATION <span className="text-race">FAQ.</span>
            </h2>
          </div>
          <ul className="divide-y divide-cloud border-y border-cloud">
            {FAQS.map((f) => (
              <li key={f.q}>
                <details className="group py-5">
                  <summary className="font-cond flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold text-ink">
                    {f.q}
                    <ChevronDown className="h-5 w-5 shrink-0 text-race transition-transform group-open:rotate-180" aria-hidden />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-graphite">{f.a}</p>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
