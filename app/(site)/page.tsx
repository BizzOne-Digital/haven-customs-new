import Hero from "@/components/home/Hero";
import { BrandStrip, EditorialRow, FeaturedServices, FinalCta, HowItWorks, PrecisionBanner, Reviews, ServicesGrid, TrustStrip, type ServiceTile } from "@/components/home/Sections";
import { HomeFaq, OffersTeaser, ShadeGuide, VisitShop } from "@/components/home/MoreSections";
import { getActiveOffers, getCategories, getPage, getProducts, getSettings } from "@/lib/queries";
import { IMG } from "@/lib/seed-data";
import { localBusinessJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

const TILES = [
  { title: "Window Tint", cats: ["window-tint"], img: IMG.tint },
  { title: "Paint Protection", cats: ["paint-protection"], img: IMG.ppf },
  { title: "Dashcams & CarPlay", cats: ["dashcams", "carplay-cameras"], img: IMG.dashcam },
  { title: "Lighting", cats: ["lighting"], img: IMG.light },
  { title: "Exterior Customization", cats: ["exterior"], img: IMG.exterior },
  { title: "Tires & Repairs", cats: ["tires", "repairs"], img: IMG.tire },
];

export default async function HomePage() {
  const [home, reviews, settings, categories, featured, offers] = await Promise.all([
    getPage("home"),
    getPage("reviews"),
    getSettings(),
    getCategories().catch(() => []),
    getProducts({ featured: true }).catch(() => []),
    getActiveOffers(),
  ]);

  const tiles: ServiceTile[] = TILES.map((t) => {
    const cat = categories.find((c) => c.slug === t.cats[0]);
    return {
      title: t.title,
      href: `/services?category=${t.cats.join(",")}`,
      // Admin-uploaded category covers win; otherwise use the current built-in artwork.
      image: cat?.image?.startsWith("/api/uploads/") ? cat.image : t.img,
      alt: t.title,
    };
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd(settings)) }} />
      <Hero
        line1={home.heroLine1}
        line2={home.heroLine2}
        tagline={home.heroTagline}
        text={home.heroText}
        image={home.heroImage}
        imageAlt={home.heroImageAlt}
        mode={home.heroImageMode}
      />
      <TrustStrip />
      <ServicesGrid eyebrow={home.servicesEyebrow} heading={home.servicesHeading} accent={home.servicesHeadingAccent} tiles={tiles} />
      <FeaturedServices items={featured} />
      <OffersTeaser offers={offers} />
      <PrecisionBanner l1={home.precisionLine1} l2={home.precisionLine2} l3={home.precisionLine3} text={home.precisionText} image={home.precisionImage} />
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-14 px-4 sm:px-6 lg:gap-16 lg:px-10">
          <EditorialRow
            eyebrow={home.protectEyebrow}
            accent={home.protectHeadingAccent}
            heading={home.protectHeading}
            text={home.protectText}
            uprightHeading
            linkLabel="Explore Paint Protection"
            href="/services?category=paint-protection"
            image={home.protectImage}
            imageAlt="Paint protection film being installed"
          />
          <EditorialRow
            reverse
            eyebrow={home.upgradeEyebrow}
            accent={home.upgradeHeadingAccent}
            heading={home.upgradeHeading}
            text={home.upgradeText}
            linkLabel="Explore Our Services"
            href="/services"
            image={home.upgradeImage}
            imageAlt="Driver's view of a car dashboard"
          />
        </div>
      </section>
      <ShadeGuide image={IMG.precisionCar} />
      <HowItWorks />
      <Reviews items={(reviews.items ?? []).filter((r) => r.approved)} />
      <HomeFaq />
      <VisitShop s={settings} />
      <BrandStrip />
      <FinalCta heading={home.ctaHeading} text={home.ctaText} />
    </>
  );
}
