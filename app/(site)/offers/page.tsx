import type { Metadata } from "next";
import Link from "next/link";
import { Tag } from "lucide-react";
import PageHero from "@/components/site/PageHero";
import SafeImage from "@/components/ui/SafeImage";
import Arrow from "@/components/site/Arrow";
import { getActiveOffers } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Current Offers",
  description: "Limited-time offers on tint, dashcams and more at Haven Customs, Scarborough. Contact us for details.",
  alternates: { canonical: "/offers" },
};

export default async function OffersPage() {
  const offers = await getActiveOffers();
  return (
    <>
      <PageHero
        eyebrow="Offers"
        heading="CURRENT"
        accent="OFFERS."
        intro="Limited-time offers change through the year. Contact us for details and availability for your vehicle."
      />
      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-10">
          {offers.length === 0 ? (
            <div className="flex flex-col items-center gap-4 border border-dashed border-mist px-6 py-16 text-center">
              <Tag className="h-8 w-8 text-silver" aria-hidden />
              <p className="heading text-2xl">No offers running right now</p>
              <p className="max-w-md text-sm text-steel">New offers are added regularly. Send us your vehicle details and we&apos;ll let you know about current deals.</p>
              <Link href="/contact" className="btn btn-red">Contact us <Arrow /></Link>
            </div>
          ) : (
            <ul className="grid gap-8 md:grid-cols-2">
              {offers.map((o) => (
                <li key={o.id} className="flex flex-col border border-cloud">
                  <div className="relative aspect-[16/8] bg-cloud">
                    <SafeImage src={o.image} alt={o.title} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" fallbackLabel="Offer" />
                    <span className="absolute left-0 top-4 bg-race px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white">Limited time</span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="heading text-3xl">{o.title}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-graphite">{o.description}</p>
                    {o.endsAt && <p className="mt-2 text-xs font-medium text-steel">Ends {new Date(o.endsAt).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" })}</p>}
                    {o.products.length > 0 && (
                      <ul className="mt-4 flex flex-wrap gap-2">
                        {o.products.map((p) => (
                          <li key={p.slug}><Link href={`/services/${p.slug}`} className="border border-mist px-3 py-1.5 text-xs font-medium text-ink hover:border-ink">{p.name}</Link></li>
                        ))}
                      </ul>
                    )}
                    <Link href={`/contact?service=${o.products.map((p) => p.slug).join(",")}`} className="btn btn-red mt-6 self-start">
                      Ask about this offer <Arrow />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
