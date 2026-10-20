import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/site/PageHero";
import Arrow from "@/components/site/Arrow";

export const metadata: Metadata = {
  title: "Brands",
  description: "The film, coating, dashcam and tire brands we work with at Haven Customs, Scarborough.",
  alternates: { canonical: "/brands" },
};

const GROUPS = [
  {
    title: "Film & Protection",
    brands: [
      { name: "XPEL", text: "XPEL Black paint protection film for full body, front end and individual panels.", href: "/services?category=paint-protection" },
      { name: "EVER", text: "EVER ceramic and nano ceramic window film, including the EVER IR series.", href: "/services?category=window-tint" },
    ],
  },
  {
    title: "Dashcams",
    brands: [
      { name: "AzDome", text: "AzDome 550 PRO and M580 3-channel dashcams.", href: "/services/azdome-550-pro" },
      { name: "Lingdu", text: "Lingdu V630 4K and LD02 5K dashcams with voice command.", href: "/services/lingdu-v630-4k" },
      { name: "Blackbox", text: "Blackbox 1080p 3-channel dashcam.", href: "/services/hd-3-channel-dashcam" },
      { name: "Haven", text: "Haven-brand 4K 3-channel dashcam.", href: "/services/haven-4k-3-channel-dashcam" },
    ],
  },
  {
    title: "Tires",
    brands: ["Michelin", "Pirelli", "Bridgestone", "Toyo", "Yokohama", "Nitto"].map((n) => ({
      name: n,
      text: `We mount, swap, rotate and balance ${n} tires.`,
      href: "/services?category=tires",
    })),
  },
];

export default function BrandsPage() {
  return (
    <>
      <PageHero
        eyebrow="Brands"
        heading="QUALITY BRANDS"
        accent="WE TRUST."
        intro="We work with established film, coating, camera and tire brands. Brand names are shown for product identification only."
      />
      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-[1320px] space-y-14 px-4 sm:px-6 lg:px-10">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <h2 className="heading border-b border-cloud pb-3 text-3xl">{g.title}</h2>
              <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {g.brands.map((b) => (
                  <li key={b.name}>
                    <Link href={b.href} className="group flex h-full flex-col border border-cloud p-6 transition-colors hover:border-silver">
                      <span className="display text-4xl text-ink group-hover:text-race">{b.name}</span>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">{b.text}</p>
                      <span className="link-arrow mt-4">Related services <Arrow /></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
