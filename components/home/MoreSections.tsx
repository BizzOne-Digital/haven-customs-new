import Link from "next/link";
import { ChevronDown, Clock, MapPin, Phone } from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";
import Arrow from "@/components/site/Arrow";
import BookButton from "@/components/site/BookButton";
import type { PublicOffer, PublicSettings } from "@/lib/queries";

/* ───────────── Tint shade guide ───────────── */

const SHADES = [
  { vlt: 5, label: "Limo", text: "Maximum privacy. Darkest option." },
  { vlt: 15, label: "Dark", text: "Strong privacy with a sleek look." },
  { vlt: 20, label: "Dark", text: "Popular balance of style and privacy." },
  { vlt: 35, label: "Medium", text: "Noticeable tint, easier night visibility." },
  { vlt: 50, label: "Light", text: "Subtle look with heat rejection." },
  { vlt: 70, label: "Clear", text: "Barely visible, still cuts heat and UV." },
];

export function ShadeGuide({ image }: { image: string }) {
  return (
    <section className="bg-white py-14 lg:py-20">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Window tint</p>
            <h2 className="heading mt-3 text-[clamp(2.6rem,6vw,4.25rem)]">
              PICK YOUR <span className="text-race">SHADE.</span>
            </h2>
            <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-graphite">
              Every shade is available in ceramic and nano ceramic film. The percentage is how much light passes through — lower is darker.
            </p>
          </div>
          <Link href="/services?category=window-tint" className="link-arrow text-ink hover:text-race">
            Explore window tint <Arrow className="h-4 w-4 text-race" />
          </Link>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {SHADES.map((s) => (
            <li key={s.vlt} className="border border-cloud">
              <div className="relative aspect-[4/3] overflow-hidden bg-cloud">
                <SafeImage src={image} alt="" fill sizes="(min-width:1024px) 200px, 45vw" className="object-cover" />
                {/* Darkness approximates the film's visible light transmission */}
                <div aria-hidden className="absolute inset-0 bg-black" style={{ opacity: (1 - s.vlt / 100) * 0.88 }} />
                <span className="font-num absolute bottom-2 left-3 text-4xl font-medium text-white drop-shadow">{s.vlt}%</span>
              </div>
              <div className="p-3">
                <p className="font-cond text-lg font-bold text-ink">{s.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-steel">{s.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-steel">Colour shades also available: purple, blue and mixed. Ask our team which shade suits your vehicle.</p>
      </div>
    </section>
  );
}

/* ───────────── Current offers (hidden when none are active) ───────────── */

export function OffersTeaser({ offers }: { offers: PublicOffer[] }) {
  if (!offers.length) return null;
  return (
    <section className="bg-pearl py-14 lg:py-20">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Limited time</p>
            <h2 className="heading mt-3 text-[clamp(2.6rem,6vw,4.25rem)]">
              CURRENT <span className="text-race">OFFERS.</span>
            </h2>
          </div>
          <Link href="/offers" className="link-arrow text-ink hover:text-race">
            All offers <Arrow className="h-4 w-4 text-race" />
          </Link>
        </div>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {offers.slice(0, 3).map((o) => (
            <li key={o.id} className="flex flex-col border border-cloud bg-white">
              <div className="relative aspect-[16/9] bg-cloud">
                <SafeImage src={o.image} alt={o.title} fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover" fallbackLabel="Offer" />
                <span className="absolute left-0 top-4 bg-race px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white">Offer</span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-cond text-xl font-bold text-ink">{o.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-steel">{o.description}</p>
                <Link href={`/contact?service=${o.products.map((p) => p.slug).join(",")}`} className="link-arrow mt-auto pt-4">
                  Ask about this offer <Arrow />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ───────────── FAQ ───────────── */

const FAQS = [
  {
    q: "Why don't you list prices?",
    a: "Pricing depends on your vehicle size and the options you choose. Send a quote request or call us and our team will give you exact details.",
  },
  {
    q: "What's the difference between ceramic and nano ceramic tint?",
    a: "Nano ceramic is our premium film with stronger heat and UV/IR rejection. Ceramic tint carries a 1-year warranty against peeling and bubbling; nano ceramic carries 7 years and also covers colour fading.",
  },
  { q: "How long does a dashcam installation take?", a: "About 40 minutes. Wires are routed and hidden — no hanging cables." },
  {
    q: "When can I book ceramic coating or head / tail light tint?",
    a: "These services are booked Monday to Thursday. For ceramic coating, plan to leave the vehicle with us for one full day.",
  },
  {
    q: "Do you do body work, paint repair or detailing?",
    a: "No. We don't offer body work, bumper or paint repair, powder coating, car detailing, rust proofing, AC repair, mats, wiper blades or roof racks.",
  },
  { q: "How do warranty claims work?", a: "Bring your original receipt. Our front desk can confirm the full warranty terms for your service." },
];

export function HomeFaq() {
  return (
    <section className="bg-white py-14 lg:py-20">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
        <div>
          <p className="eyebrow">Questions</p>
          <h2 className="heading mt-3 text-[clamp(2.6rem,6vw,4.25rem)]">
            GOOD TO <span className="text-race">KNOW.</span>
          </h2>
          <p className="mt-4 max-w-sm text-[0.95rem] leading-relaxed text-graphite">Can&apos;t find your answer? Our team is happy to help.</p>
          <Link href="/contact" className="btn btn-red mt-6 px-8">
            Ask a question <Arrow />
          </Link>
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
  );
}

/* ───────────── Visit the shop ───────────── */

export function VisitShop({ s }: { s: PublicSettings }) {
  return (
    <section className="bg-pearl py-14 lg:py-20">
      <div className="mx-auto grid max-w-[1320px] items-stretch gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
        <div className="flex flex-col justify-center">
          <p className="eyebrow">Visit us</p>
          <h2 className="heading mt-3 text-[clamp(2.6rem,6vw,4.25rem)]">
            COME SEE <span className="text-race">THE SHOP.</span>
          </h2>
          <ul className="mt-6 space-y-4 text-[0.95rem] text-graphite">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-race" aria-hidden /> {s.address}
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-race" aria-hidden /> {s.hours}
            </li>
            <li>
              <a href={s.phoneHref} className="flex gap-3 font-semibold text-ink hover:text-race">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-race" aria-hidden /> {s.phone}
              </a>
            </li>
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <BookButton className="btn btn-red px-8" />
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(s.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline px-8"
            >
              Get directions <Arrow />
            </a>
          </div>
        </div>
        {s.mapEmbedUrl && (
          <div data-reveal="right" className="relative min-h-[320px] overflow-hidden border border-cloud bg-cloud">
            <iframe
              title="Map to Haven Customs"
              src={s.mapEmbedUrl}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}
      </div>
    </section>
  );
}
