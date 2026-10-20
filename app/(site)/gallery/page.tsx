import type { Metadata } from "next";
import Link from "next/link";
import { Images } from "lucide-react";
import PageHero from "@/components/site/PageHero";
import GalleryGrid from "@/components/site/GalleryGrid";
import Arrow from "@/components/site/Arrow";
import { getGallery, getSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Gallery",
  description: "Tint, protection and custom upgrade work from the Haven Customs shop in Scarborough.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const [items, s] = await Promise.all([getGallery(), getSettings()]);
  return (
    <>
      <PageHero eyebrow="Gallery" heading="RECENT" accent="WORK." intro="A look at vehicles that have come through the shop." />
      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-10">
          {items.length ? (
            <GalleryGrid items={items} />
          ) : (
            <div className="flex flex-col items-center gap-4 border border-dashed border-mist px-6 py-16 text-center">
              <Images className="h-8 w-8 text-silver" aria-hidden />
              <p className="heading text-2xl">Gallery coming soon</p>
              <p className="max-w-md text-sm text-steel">We&apos;re adding photos of recent work. In the meantime, see more on our social channels.</p>
              <div className="flex flex-wrap justify-center gap-3">
                {s.instagram && <a href={s.instagram} target="_blank" rel="noopener noreferrer" className="btn btn-outline">Instagram</a>}
                <Link href="/services" className="btn btn-red">Explore services <Arrow /></Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
