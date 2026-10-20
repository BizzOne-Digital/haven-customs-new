import type { PublicProduct, PublicSettings } from "./queries";

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

/** Accurate structured data only — no ratings, reviews or prices. */
export function localBusinessJsonLd(s: PublicSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "AutoPartsStore",
    name: s.businessName,
    url: siteUrl(),
    telephone: s.phone,
    ...(s.email ? { email: s.email } : {}),
    image: `${siteUrl()}/logo.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: s.addressLine1,
      addressLocality: "Scarborough",
      addressRegion: "ON",
      postalCode: "M1H 2X8",
      addressCountry: "CA",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "11:00",
        closes: "20:00",
      },
    ],
    sameAs: [s.instagram, s.facebook].filter(Boolean),
  };
}

export function serviceJsonLd(p: PublicProduct) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: p.name,
    description: p.shortDescription,
    serviceType: p.category?.name,
    url: `${siteUrl()}/services/${p.slug}`,
    provider: { "@type": "AutoPartsStore", name: "Haven Customs", url: siteUrl() },
    areaServed: { "@type": "City", name: "Scarborough, ON" },
    ...(p.brand ? { brand: { "@type": "Brand", name: p.brand } } : {}),
  };
}
