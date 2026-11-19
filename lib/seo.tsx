import type { PublicProduct, PublicSettings } from "./queries";

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const BUSINESS_ID = () => `${siteUrl()}/#business`;
const LEGAL_NAME = "Haven Customs Tint & Tire Inc.";
const GEO = { latitude: 43.7801512, longitude: -79.2364066 };
const AREAS = ["Scarborough", "Toronto", "North York", "Markham", "Pickering", "Ajax"];

/**
 * LocalBusiness (AutoRepair) markup. Only facts shown on the site — no AggregateRating
 * (self-served review markup is ignored or penalised by Google), no price range, and the
 * email only once it is confirmed in Admin → Settings.
 */
export function localBusinessJsonLd(s: PublicSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "@id": BUSINESS_ID(),
    name: LEGAL_NAME,
    alternateName: s.businessName,
    url: `${siteUrl()}/`,
    telephone: "+1-" + s.phone.replace(/\D/g, "").slice(-10).replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3"),
    ...(s.email ? { email: s.email } : {}),
    image: `${siteUrl()}/og-image.jpg`,
    logo: `${siteUrl()}/logo.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: s.addressLine1,
      addressLocality: "Scarborough",
      addressRegion: "ON",
      postalCode: "M1H 2X8",
      addressCountry: "CA",
    },
    geo: { "@type": "GeoCoordinates", ...GEO },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "11:00",
        closes: "20:00",
      },
    ],
    areaServed: AREAS,
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
    provider: { "@id": BUSINESS_ID() },
    areaServed: AREAS.map((name) => ({ "@type": "City", name })),
    ...(p.brand ? { brand: { "@type": "Brand", name: p.brand } } : {}),
  };
}

/** FAQPage — only for questions and answers visible on the same page. */
export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

/** BreadcrumbList. The last crumb (current page) has no URL. */
export function breadcrumbJsonLd(crumbs: { name: string; path?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...crumbs].map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      ...(c.path ? { item: `${siteUrl()}${c.path === "/" ? "/" : c.path}` } : {}),
    })),
  };
}

/** Renders one or more JSON-LD objects. Escapes "<" so content can't close the script tag. */
export function JsonLd({ data }: { data: object | object[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d).replace(/</g, "\\u003c") }} />
      ))}
    </>
  );
}
