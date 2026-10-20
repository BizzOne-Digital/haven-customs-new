import { IMG } from "./images";

/** Editable page copy. Admin "Pages" stores overrides; anything missing falls back to these defaults. */
export const PAGE_DEFAULTS = {
  home: {
    heroLine1: "MAKE IT",
    heroLine2: "YOUR OWN.",
    heroTagline: "TINT.\nPROTECT.\nCUSTOMIZE.",
    heroText: "Premium automotive upgrades in Scarborough.",
    heroImage: IMG.heroCar,
    heroImageAlt: "Top-down graphite convertible with tan leather interior",
    /** "photo" = framed photograph; "cutout" = transparent PNG placed over the type. */
    heroImageMode: "cutout",
    servicesEyebrow: "OUR SERVICES",
    servicesHeading: "BUILT AROUND YOUR",
    servicesHeadingAccent: "DRIVE.",
    precisionLine1: "PRECISION",
    precisionLine2: "IN EVERY",
    precisionLine3: "DETAIL.",
    precisionText: "Premium tint, protection and custom upgrades.\nEngineered for drivers who expect more.",
    precisionImage: IMG.precisionCar,
    protectEyebrow: "PROTECT WHAT MOVES YOU.",
    protectHeadingAccent: "PROTECT",
    protectHeading: "YOUR FINISH.",
    protectText:
      "Keep your vehicle looking its best with premium tint and paint protection. Invisible defence, lasting results.",
    protectImage: IMG.ppf,
    upgradeEyebrow: "MORE THAN A DRIVE.",
    upgradeHeadingAccent: "UPGRADE",
    upgradeHeading: "YOUR EVERYDAY.",
    upgradeText:
      "From dashcams and CarPlay to custom lighting, we help you create a driving experience that feels like you.",
    upgradeImage: IMG.interior,
    ctaHeading: "YOUR NEXT UPGRADE STARTS HERE.",
    ctaText: "Tell us what you drive. We'll take care of the details.",
  },
  about: {
    heading: "BUILT BY ENTHUSIASTS.",
    headingAccent: "ABOUT",
    intro:
      "Haven Customs is an automotive upgrade shop in Scarborough, Ontario. We focus on window tint, paint protection, dashcams, CarPlay, lighting, exterior styling and tire services — done cleanly, explained clearly, and backed by warranty where it applies.",
    body:
      "Every vehicle that comes through our shop gets the same attention: an honest recommendation for what you actually need, quality materials from brands like XPEL and EVER, and installation that looks right when you pick it up.\n\nTell us what you drive and what you want from it. We'll take care of the details.",
    image: IMG.ceramic,
    values: [
      { title: "Clear recommendations", text: "We explain options for your vehicle so you can choose with confidence." },
      { title: "Quality materials", text: "Films, coatings and cameras from brands we trust." },
      { title: "Clean installation", text: "Hidden wiring, careful prep and a final check before handover." },
    ],
  },
  contact: {
    heading: "LET'S TALK ABOUT YOUR",
    headingAccent: "CAR.",
    intro: "Send us your vehicle and the services you're interested in. Our team will get back to you with options and next steps.",
  },
  booking: {
    heading: "BOOK YOUR",
    headingAccent: "APPOINTMENT.",
    intro: "Pick a time that works for you. Appointments are confirmed by our team by text or email.",
  },
  reviews: {
    /** Only approved reviews are published. Section stays hidden while empty. */
    items: [] as { name: string; text: string; service?: string; approved: boolean }[],
  },
};

export type PageKey = keyof typeof PAGE_DEFAULTS;
export const PAGE_KEYS = Object.keys(PAGE_DEFAULTS) as PageKey[];
export function isPageKey(v: string): v is PageKey {
  return (PAGE_KEYS as string[]).includes(v);
}
