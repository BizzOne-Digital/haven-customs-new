import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import BookingEmbed from "@/components/site/BookingEmbed";
import { getPage, getProducts, getSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Book an Appointment",
  description: "Book tint, PPF, ceramic coating, dashcam, CarPlay, lighting or tire appointments at Haven Customs in Scarborough.",
  alternates: { canonical: "/booking" },
};

export default async function BookingPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const sp = await searchParams;
  const [page, products, s] = await Promise.all([getPage("booking"), getProducts(), getSettings()]);
  const services = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    calendarKey: p.calendarKey,
    bookingNote: p.bookingNote,
    group: p.category?.name ?? "Other",
  }));
  return (
    <>
      <PageHero eyebrow="Booking" heading={page.heading} accent={page.headingAccent} intro={s.bookingIntro || page.intro} />
      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-10">
          <BookingEmbed services={services} initial={sp.service} />
        </div>
      </section>
    </>
  );
}
