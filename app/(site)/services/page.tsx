import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SearchX } from "lucide-react";
import PageHero from "@/components/site/PageHero";
import ServiceCard from "@/components/site/ServiceCard";
import ServiceFilters from "@/components/site/ServiceFilters";
import { VEHICLE_TYPES } from "@/lib/constants";
import { getCategories, getProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Window tint, PPF, ceramic coating, dashcams, CarPlay, lighting, chrome delete and tire services in Scarborough. Contact us for a quote.",
  alternates: { canonical: "/services" },
};

type SP = Promise<{ q?: string; category?: string; vehicle?: string }>;

export default async function ServicesPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const categories = await getCategories();
  const selected = (sp.category ?? "").split(",").filter((s) => categories.some((c) => c.slug === s));
  const vehicle = (VEHICLE_TYPES as readonly string[]).includes(sp.vehicle ?? "") ? sp.vehicle : undefined;
  const products = await getProducts({ categories: selected, vehicle, q: sp.q?.slice(0, 80) });

  const grouped = categories
    .map((c) => ({ cat: c, items: products.filter((p) => p.category?.slug === c.slug) }))
    .filter((g) => g.items.length);

  return (
    <>
      <PageHero
        eyebrow="Our services"
        heading="EVERYTHING WE"
        accent="DO."
        intro="Browse every service we offer. Pricing depends on your vehicle and options — send us a request and our team will get back to you with a quote."
      />
      <section className="bg-white py-10 lg:py-14">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-10">
          <Suspense>
            <ServiceFilters categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />
          </Suspense>
          <p className="mt-6 text-sm text-steel" aria-live="polite">
            {products.length} service{products.length === 1 ? "" : "s"}
          </p>

          {grouped.length === 0 ? (
            <div className="mt-8 flex flex-col items-center gap-4 border border-dashed border-mist px-6 py-16 text-center">
              <SearchX className="h-8 w-8 text-silver" aria-hidden />
              <p className="heading text-2xl">No services match those filters</p>
              <p className="max-w-md text-sm text-steel">
                Try a different search or clear the filters. Not sure what you need? Tell us about your vehicle and we&apos;ll recommend options.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/services" className="btn btn-outline">Clear filters</Link>
                <Link href="/contact" className="btn btn-red">Ask our team</Link>
              </div>
            </div>
          ) : (
            grouped.map(({ cat, items }) => (
              <div key={cat.slug} className="mt-12 first-of-type:mt-8">
                <div className="flex flex-col gap-1 border-b border-cloud pb-3 sm:flex-row sm:items-end sm:justify-between">
                  <h2 className="heading text-3xl">{cat.name}</h2>
                  <p className="max-w-xl text-sm text-steel">{cat.description}</p>
                </div>
                <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((p) => (
                    <li key={p.slug}>
                      <ServiceCard p={p} />
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}
