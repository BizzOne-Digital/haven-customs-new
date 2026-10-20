import Link from "next/link";
import { BadgeCheck, CalendarCheck, ClipboardCheck, Gem, KeyRound, MessageSquareText, Wrench } from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";
import Arrow from "@/components/site/Arrow";
import BookButton from "@/components/site/BookButton";
import ServiceCard from "@/components/site/ServiceCard";
import type { PublicProduct } from "@/lib/queries";

export function TrustStrip() {
  const items = [
    { icon: Wrench, label: "Expert installation" },
    { icon: BadgeCheck, label: "Quality materials" },
    { icon: Gem, label: "Warranty-backed workmanship" },
  ];
  return (
    <section aria-label="Why Haven Customs" className="border-y border-cloud bg-white">
      <ul className="mx-auto grid max-w-[1320px] grid-cols-3 px-2 sm:px-6 lg:px-10">
        {items.map(({ icon: Icon, label }, i) => (
          <li
            key={label}
            className={`flex flex-col items-center justify-center gap-2 px-2 py-5 text-center text-[0.7rem] font-medium leading-tight text-ink sm:flex-row sm:gap-3 sm:text-sm lg:py-6 ${i ? "border-l border-cloud" : ""}`}
          >
            <Icon className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" strokeWidth={1.6} aria-hidden />
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}

export type ServiceTile = { title: string; href: string; image: string; alt: string };

export function ServicesGrid({ eyebrow, heading, accent, tiles }: { eyebrow: string; heading: string; accent: string; tiles: ServiceTile[] }) {
  return (
    <section id="services" className="scroll-mt-[84px] bg-white py-14 lg:scroll-mt-[100px] lg:py-20">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="heading mt-3 text-[clamp(2.6rem,6vw,4.25rem)]">
              {heading} <span className="text-race">{accent}</span>
            </h2>
          </div>
          <Link href="/services" className="link-arrow text-ink hover:text-race">
            View all services <Arrow className="h-4 w-4 text-race" />
          </Link>
        </div>
        <ul className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((t, i) => (
            <li key={t.title}>
              <Link href={t.href} className="group block">
                <div className="relative aspect-[16/8.5] overflow-hidden bg-cloud">
                  <SafeImage
                    src={t.image}
                    alt={t.alt}
                    fill
                    sizes="(min-width:1024px) 400px, (min-width:640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="mt-4 flex items-start gap-4">
                  <span className="font-num text-3xl font-medium leading-none text-silver">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-cond text-xl font-bold leading-tight text-ink">{t.title}</h3>
                    <span className="link-arrow mt-1 text-xs font-medium text-steel group-hover:text-race">
                      Explore service <Arrow className="h-3.5 w-3.5 text-race" />
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function PrecisionBanner({ l1, l2, l3, text, image }: { l1: string; l2: string; l3: string; text: string; image: string }) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(100deg,#f4f4f5_0%,#ebecee_60%,#dfe0e3_100%)]">
      <div aria-hidden className="absolute inset-y-0 right-[30%] hidden w-[38%] -skew-x-[24deg] bg-white/50 lg:block" />
      <div aria-hidden className="absolute -right-10 top-0 hidden h-full w-[16%] -skew-x-[24deg] bg-race/90 lg:block" />
      <div className="relative mx-auto grid max-w-[1320px] items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:py-0">
        <div className="lg:py-20">
          <h2 className="display text-[clamp(3.6rem,9vw,7rem)]">
            <span className="block text-race">{l1}</span>
            <span className="block text-ink">{l2}</span>
            <span className="block text-ink">{l3}</span>
          </h2>
          <p className="mt-6 max-w-sm whitespace-pre-line text-[0.95rem] leading-relaxed text-graphite">{text}</p>
          <div className="mt-7">
            <BookButton />
          </div>
        </div>
        <div data-reveal="right" className="relative -mx-4 aspect-[16/10] sm:mx-0 lg:aspect-auto lg:h-full lg:min-h-[480px]">
          <SafeImage
            src={image}
            alt="Graphite performance car"
            fill
            sizes="(min-width:1024px) 720px, 100vw"
            className="object-cover object-center lg:[clip-path:polygon(14%_0,100%_0,100%_100%,0_100%)]"
          />
        </div>
      </div>
    </section>
  );
}

export function EditorialRow({
  eyebrow,
  accent,
  heading,
  text,
  linkLabel,
  href,
  image,
  imageAlt,
  reverse = false,
  uprightHeading = false,
}: {
  eyebrow: string;
  accent: string;
  heading: string;
  text: string;
  linkLabel: string;
  href: string;
  image: string;
  imageAlt: string;
  reverse?: boolean;
  uprightHeading?: boolean;
}) {
  return (
    <div className={`grid items-center gap-6 md:grid-cols-2 lg:gap-12 ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}>
      <div data-reveal={reverse ? "right" : "left"} className="relative aspect-[16/8] overflow-hidden bg-cloud">
        <SafeImage src={image} alt={imageAlt} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
      </div>
      <div className={reverse ? "md:pl-0" : "md:pr-6"}>
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-steel">{eyebrow}</p>
        <h2 className="display mt-2 text-[clamp(2.6rem,5vw,3.6rem)]">
          <span className="block text-race">{accent}</span>
          <span className={`block text-ink ${uprightHeading ? "upright" : ""}`}>{heading}</span>
        </h2>
        <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-graphite">{text}</p>
        <Link href={href} className="link-arrow mt-4">
          {linkLabel} <Arrow />
        </Link>
      </div>
    </div>
  );
}

const BRANDS = [
  { name: "XPEL", cls: "font-display text-2xl italic tracking-tight" },
  { name: "EVER", cls: "font-sans text-lg font-semibold tracking-[0.2em]" },
  { name: "AZDOME", cls: "font-sans text-lg font-bold tracking-[0.18em]" },
  { name: "LINGDU", cls: "font-sans text-lg font-light tracking-[0.3em]" },
  { name: "MICHELIN", cls: "font-display text-xl italic tracking-wide" },
  { name: "PIRELLI", cls: "font-display text-2xl tracking-wide" },
];

export function BrandStrip() {
  return (
    <section aria-label="Quality brands we trust" className="border-t border-cloud bg-white">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-5 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:gap-10 lg:px-10">
        <p className="shrink-0 text-[0.65rem] font-bold uppercase tracking-[0.25em] text-ink">Quality brands we trust</p>
        <ul className="grid grid-cols-3 items-center gap-x-6 gap-y-5 text-ink sm:grid-cols-6 lg:flex-1 lg:divide-x lg:divide-mist">
          {BRANDS.map((b) => (
            <li key={b.name} className={`text-center ${b.cls}`}>
              {b.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function FinalCta({ heading, text }: { heading: string; text: string }) {
  return (
    <section className="relative overflow-hidden bg-race text-white">
      <div aria-hidden className="absolute -right-24 top-0 h-full w-1/2 -skew-x-[24deg] bg-white/[0.06]" />
      <div className="relative mx-auto flex max-w-[1320px] flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-14">
        <div>
          <h2 className="display max-w-2xl text-[clamp(2.6rem,6vw,4.5rem)] text-white">{heading}</h2>
          <p className="mt-3 text-sm text-white/90 sm:text-base">{text}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <BookButton className="btn btn-black px-8" />
          <Link href="/contact" className="btn btn-white px-8">
            Get a Quote <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Reviews({ items }: { items: { name: string; text: string; service?: string }[] }) {
  if (!items.length) return null;
  return (
    <section className="bg-pearl py-14 lg:py-20">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-10">
        <p className="eyebrow">Reviews</p>
        <h2 className="heading mt-3 text-[clamp(2.4rem,5vw,3.6rem)]">
          WHAT DRIVERS <span className="text-race">SAY.</span>
        </h2>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {items.slice(0, 6).map((r, i) => (
            <li key={i} className="border-l-2 border-race bg-white p-6">
              <blockquote className="text-[0.95rem] leading-relaxed text-graphite">“{r.text}”</blockquote>
              <p className="mt-4 text-sm font-bold text-ink">{r.name}</p>
              {r.service && <p className="text-xs text-steel">{r.service}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function FeaturedServices({ items }: { items: PublicProduct[] }) {
  if (!items.length) return null;
  return (
    <section className="bg-pearl py-14 lg:py-20">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Most requested</p>
            <h2 className="heading mt-3 text-[clamp(2.6rem,6vw,4.25rem)]">
              POPULAR <span className="text-race">SERVICES.</span>
            </h2>
            <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-graphite">
              The upgrades drivers ask us about most. Pricing depends on your vehicle — request a quote and we&apos;ll give you exact details.
            </p>
          </div>
          <Link href="/services" className="link-arrow text-ink hover:text-race">
            Browse all services <Arrow className="h-4 w-4 text-race" />
          </Link>
        </div>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.slice(0, 8).map((p) => (
            <li key={p.slug}>
              <ServiceCard p={p} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const STEPS = [
  { icon: MessageSquareText, title: "Tell us what you drive", text: "Share your vehicle and the services you're interested in — online or by phone." },
  { icon: ClipboardCheck, title: "Get clear options", text: "Our team recommends the right film, coverage or product for your vehicle and budget." },
  { icon: CalendarCheck, title: "Book a time", text: "Pick an appointment that works for you. Some services are booked Monday – Thursday." },
  { icon: KeyRound, title: "Drive away upgraded", text: "Clean installation, a final check before handover, and warranty where it applies." },
];

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-ink py-14 text-white lg:py-20">
      <div aria-hidden className="absolute -right-32 top-0 h-full w-1/2 -skew-x-[24deg] bg-white/[0.03]" />
      <div className="relative mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-10">
        <p className="eyebrow">How it works</p>
        <h2 className="display mt-3 text-[clamp(2.6rem,6vw,4.5rem)]">
          FROM QUOTE TO <span className="text-race">KEYS.</span>
        </h2>
        <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="border-t border-white/15 pt-6">
              <div className="flex items-center justify-between">
                <span className="font-num text-4xl font-medium leading-none text-race">{String(i + 1).padStart(2, "0")}</span>
                <Icon className="h-6 w-6 text-silver" strokeWidth={1.6} aria-hidden />
              </div>
              <h3 className="font-cond mt-5 text-xl font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/contact" className="btn btn-red px-8">Get a Quote <Arrow /></Link>
          <BookButton className="btn btn-white px-8 text-ink!" />
        </div>
      </div>
    </section>
  );
}
