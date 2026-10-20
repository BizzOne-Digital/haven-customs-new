import type { Metadata } from "next";
import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import PageHero from "@/components/site/PageHero";
import Arrow from "@/components/site/Arrow";
import BookButton from "@/components/site/BookButton";
import { BrandStrip } from "@/components/home/Sections";
import { getPage, getSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "About",
  description: "Haven Customs is an automotive upgrade shop in Scarborough, ON — tint, protection, dashcams, CarPlay, lighting and tires.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [a, s] = await Promise.all([getPage("about"), getSettings()]);
  return (
    <>
      <PageHero eyebrow={a.headingAccent} heading={a.heading} intro={a.intro} />
      <section className="bg-white py-12 lg:py-20">
        <div className="mx-auto grid max-w-[1320px] items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-10">
          <div className="relative aspect-[4/3] overflow-hidden bg-cloud">
            <SafeImage src={a.image} alt="Haven Customs technician at work" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <p className="eyebrow">{s.addressLine2}</p>
            <div className="mt-4 space-y-4 whitespace-pre-line text-[0.98rem] leading-relaxed text-graphite">{a.body}</div>
            <div className="mt-8 flex flex-wrap gap-3">
              <BookButton />
              <Link href="/services" className="btn btn-outline">Our services <Arrow /></Link>
            </div>
          </div>
        </div>
        <ul className="mx-auto mt-16 grid max-w-[1320px] gap-6 px-4 sm:px-6 md:grid-cols-3 lg:px-10">
          {a.values.map((v, i) => (
            <li key={v.title} className="border-t-2 border-race pt-5">
              <span className="font-num text-3xl font-medium text-silver">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="mt-2 text-lg font-bold text-ink">{v.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-steel">{v.text}</p>
            </li>
          ))}
        </ul>
      </section>
      <BrandStrip />
    </>
  );
}
