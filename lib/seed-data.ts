/**
 * Initial catalog (source: HAVEN_CUSTOMS_BUILD_BRIEF.md + sales script).
 * Public copy contains NO prices. Internal prices from the sales script are kept in
 * `internalPrice`, which is admin-only (select:false + stripped from public DTOs).
 */
import { VEHICLE_TYPES } from "./constants";

import { IMG } from "./images";
import PRODUCT_IMAGES from "./product-images.json";
export { IMG } from "./images";

const ALL = [...VEHICLE_TYPES];

export type SeedCategory = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  image: string;
};

export const SEED_CATEGORIES: SeedCategory[] = [
  { slug: "window-tint", name: "Window Tint", icon: "sun", image: IMG.tint,
    description: "Ceramic and nano ceramic window film for heat, UV and privacy — installed with warranty." },
  { slug: "dashcams", name: "Dashcams", icon: "camera", image: IMG.dashcam,
    description: "3-channel dashcams covering front, rear and cabin, professionally installed with hidden wiring." },
  { slug: "carplay-cameras", name: "CarPlay & Cameras", icon: "monitor-smartphone", image: IMG.interior,
    description: "Portable Apple CarPlay / Android Auto screens, backup cameras and clean installations." },
  { slug: "lighting", name: "Lighting", icon: "lightbulb", image: IMG.light,
    description: "Headlight and tail light tint, headlight restoration and custom lighting upgrades." },
  { slug: "exterior", name: "Exterior Customization", icon: "paintbrush", image: IMG.exterior,
    description: "Chrome delete, logo blackout, wraps, wheel and caliper painting." },
  { slug: "paint-protection", name: "Paint Protection", icon: "shield", image: IMG.ppf,
    description: "XPEL paint protection film and multi-level ceramic coating." },
  { slug: "tires", name: "Tire Services", icon: "circle-dot", image: IMG.tire,
    description: "Tire swaps, changes, rotation and balancing for sedans, SUVs, trucks and vans." },
  { slug: "repairs", name: "Repairs", icon: "wrench", image: IMG.wheel,
    description: "Puncture repair, valves, bent steel rims, sealant and lug nut removal." },
];

type Faq = { q: string; a: string };
export type SeedProduct = {
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  longDescription: string;
  features?: string[];
  options?: string[];
  vehicleTypes?: string[];
  brand?: string;
  warranty?: string;
  bookingNote?: string;
  calendarKey?: string;
  faqs?: Faq[];
  image: string;
  imageAlt: string;
  internalPrice?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  needsReview?: boolean;
};

const SHADES = "Shades: 5%, 15%, 20%, 35%, 50%, 70% (same for ceramic and nano ceramic)";
const COLORS = "Colour shades available: purple, blue and mixed";
const TINT_INCLUDED = [
  "Free installation",
  "Warranty included",
  "EVER brand ceramic film (EVER IR series available)",
  "Heat & UV rejection",
  "Enhanced privacy & comfort",
];
const TINT_FAQ: Faq[] = [
  { q: "Which shades do you offer?", a: "5%, 15%, 20%, 35%, 50% and 70%, in both ceramic and nano ceramic film." },
  { q: "What's the difference between ceramic and nano ceramic?", a: "Nano ceramic is the premium film with stronger heat and UV/IR rejection and a longer warranty that also covers colour fading." },
  { q: "Do you carry the EVER IR series?", a: "Yes, we carry the EVER IR series." },
];
const DASH_FAQ: Faq[] = [
  { q: "What does 3-channel mean?", a: "A 3-channel dashcam records the front, rear and cabin view." },
  { q: "How long does installation take?", a: "About 40 minutes. Installed by our team with wires fully hidden — no hanging cables." },
  { q: "Can it record while parked?", a: "Yes, with a hardwire installation (fusebox or OBD) and the 24/7 parking mode add-on." },
];
const TIRE_FAQ: Faq[] = [
  { q: "What's the difference between a swap and a change?", a: "A swap means your tires are already mounted on rims. A change means the tires are not on rims and need to be mounted." },
  { q: "Do you service trucks and vans?", a: "Yes — please book an appointment for trucks and vans." },
];
const MON_THU = "Available Monday – Thursday only. Please book ahead.";
const APPT = "By appointment — book online or call the shop.";

const BASE_PRODUCTS: SeedProduct[] = [
  /* ───────── WINDOW TINT ───────── */
  {
    slug: "ceramic-tint", name: "Ceramic Tint", category: "window-tint", isFeatured: true,
    shortDescription: "EVER ceramic window film for heat, UV and privacy with free installation.",
    longDescription: "Our ceramic tint uses EVER brand ceramic film to cut glare, reduce cabin heat and add privacy. Choose full coverage of all doors plus the rear windshield, side windows only, individual side windows, or quarter windows. Every installation includes a warranty against peeling and bubbling.",
    features: [...TINT_INCLUDED, SHADES, COLORS],
    options: ["All Doors + Rear Windshield", "Side Windows Only", "Per Side Window", "Quarter Windows (sized at the shop)"],
    vehicleTypes: ALL, brand: "EVER", warranty: "1 year — peeling and bubbling",
    faqs: TINT_FAQ, image: IMG.tint, imageAlt: "Technician installing window tint on a car door",
    internalPrice: "Coupe/Sedan full $79, sides $59, per window $25 · Midsize & Extended full $99, sides $79, per window $30 · quarter $5–10",
  },
  {
    slug: "nano-ceramic-tint", name: "Nano Ceramic Tint", category: "window-tint", isFeatured: true,
    shortDescription: "Premium nano ceramic film with up to 80% UV / IR blockage and a 7-year warranty.",
    longDescription: "Nano ceramic is our premium window film. It delivers stronger heat and UV/IR rejection than standard ceramic (up to 80% blockage) and comes with a 7-year warranty that also covers colour fading. Available in the same coverage options and shades as our ceramic tint.",
    features: [...TINT_INCLUDED, "Up to 80% UV and IR blockage", SHADES, COLORS],
    options: ["All Doors + Rear Windshield", "Side Windows Only", "Per Side Window", "Quarter Windows (sized at the shop)"],
    vehicleTypes: ALL, brand: "EVER", warranty: "7 years — peeling, bubbling and colour fading",
    faqs: TINT_FAQ, image: IMG.tint, imageAlt: "Window tint film being applied to a side window",
    internalPrice: "Coupe/Sedan full $119, sides $99, per window $35 · Midsize full $129 · Extended full $139 · sides $119, per window $40",
  },
  {
    slug: "front-windshield-tint", name: "Front Windshield Tint", category: "window-tint",
    shortDescription: "Ceramic or nano ceramic front windshield film, including blue and rainbow shades.",
    longDescription: "Reduce heat and glare through the largest glass on your vehicle. Front windshield tint is available in ceramic or nano ceramic film, with mixed shade options such as blue and rainbow.",
    features: ["Ceramic or nano ceramic film", "Mixed shades such as blue or rainbow", "Free installation"],
    options: ["Ceramic", "Nano Ceramic", "Mixed shade (blue / rainbow)"],
    vehicleTypes: ALL, brand: "EVER", image: IMG.tint, imageAlt: "Car windshield",
    internalPrice: "Sedan–Midsize: ceramic $80, nano $130 · Truck–Extended: ceramic $90, nano $130",
  },
  {
    slug: "chameleon-windshield-tint", name: "Chameleon Windshield Tint", category: "window-tint",
    shortDescription: "Colour-shifting chameleon film for the front windshield — available for all vehicles.",
    longDescription: "Chameleon film shifts colour with the viewing angle for a distinctive look on the front windshield. Available for all vehicle types.",
    features: ["Colour-shifting finish", "Available for all vehicles", "Free installation"],
    vehicleTypes: ALL, image: IMG.tint, imageAlt: "Windshield with tinted film", internalPrice: "$140 all vehicles",
  },
  {
    slug: "back-windshield-tint", name: "Back Windshield Tint", category: "window-tint",
    shortDescription: "Ceramic or nano ceramic film for the rear windshield.",
    longDescription: "Tint the rear windshield on its own with ceramic or nano ceramic film — a good add-on if your side windows are already done.",
    features: ["Ceramic or nano ceramic film", "Free installation"], options: ["Ceramic", "Nano Ceramic"],
    vehicleTypes: ALL, brand: "EVER", image: IMG.tint, imageAlt: "Rear windshield of a car",
    internalPrice: "Ceramic $30 · Nano $50",
  },
  {
    slug: "panoramic-roof-tint", name: "Panoramic Roof Tint", category: "window-tint",
    shortDescription: "Tint for single or double panoramic glass roofs.",
    longDescription: "Keep the cabin cooler under a glass roof. We tint single and double panoramic roofs.",
    options: ["Single panoramic roof", "Double panoramic roof"], vehicleTypes: ALL,
    image: IMG.tint, imageAlt: "Car with a panoramic glass roof", internalPrice: "Single $30–40 · Double $50–70",
  },
  {
    slug: "sun-strip", name: "Sun Strip", category: "window-tint",
    shortDescription: "Front windshield sun strip to cut glare at the top of the glass.",
    longDescription: "A tinted strip across the top of the front windshield that reduces sun glare. Available for all cars.",
    vehicleTypes: ALL, image: IMG.tint, imageAlt: "Front windshield sun strip", internalPrice: "$30 all cars",
  },
  {
    slug: "tint-removal", name: "Tint Removal", category: "window-tint",
    shortDescription: "Clean removal of old tint from side windows, rear and front windshield.",
    longDescription: "Old or damaged film removed cleanly before new tint is installed. Back windshield removal depends on the condition of the existing film.",
    options: ["Side windows", "Back windshield", "Front windshield"], vehicleTypes: ALL,
    image: IMG.tint, imageAlt: "Old window tint being removed",
    internalPrice: "Side $10/window · Back $30 (condition) · Front $50",
  },

  /* ───────── DASHCAMS ───────── */
  {
    slug: "hd-3-channel-dashcam", name: "HD 3-Channel Dashcam", category: "dashcams", isFeatured: true,
    shortDescription: "Blackbox 1080p 3-channel dashcam with WiFi, free 32GB card and free installation.",
    longDescription: "An entry-level 3-channel dashcam from Blackbox covering front, rear and cabin. WiFi enabled, with a complimentary 32GB memory card and free plug-and-play installation.",
    features: ["1080p 3-channel recording (front, rear, cabin)", "WiFi enabled", "Free 32GB memory card", "Free plug-and-play installation", "1-year warranty"],
    vehicleTypes: ALL, brand: "Blackbox", warranty: "1 year", faqs: DASH_FAQ,
    image: IMG.dashcam, imageAlt: "Dashcam mounted on a windshield (illustrative)", internalPrice: "$69",
  },
  {
    slug: "full-hd-3-channel-dashcam", name: "Full HD 3-Channel Dashcam", category: "dashcams",
    shortDescription: "Full HD 3-channel dashcam with free 32GB card and free installation.",
    longDescription: "A Full HD 3-channel dashcam covering front, rear and cabin, supplied with a free 32GB memory card and free installation.",
    features: ["Full HD 3-channel recording", "Free 32GB memory card", "Free installation"],
    vehicleTypes: ALL, faqs: DASH_FAQ, image: IMG.dashcam, imageAlt: "Dashcam view from the driver's seat (illustrative)",
    internalPrice: "$99",
  },
  {
    slug: "haven-4k-3-channel-dashcam", name: "Haven 4K 3-Channel Dashcam", category: "dashcams", isFeatured: true,
    shortDescription: "4K Ultra HD recording with WiFi and app, free 64GB card and installation.",
    longDescription: "Haven-brand 4K Ultra HD 3-channel dashcam for high-clarity recording, with WiFi and app access. Includes a free 64GB memory card, free installation and a 1-year warranty.",
    features: ["4K Ultra HD 3-channel recording", "WiFi + app", "Free 64GB memory card", "Free installation", "1-year warranty"],
    vehicleTypes: ALL, brand: "Haven", warranty: "1 year", faqs: DASH_FAQ,
    image: IMG.dashcam, imageAlt: "Dashcam in a car interior (illustrative)", internalPrice: "$139",
  },
  {
    slug: "lingdu-v630-4k", name: "Lingdu V630 4K", category: "dashcams",
    shortDescription: "4K 3-channel flat-screen dashcam with voice command support.",
    longDescription: "The Lingdu V630 is a 4K 3-channel flat-screen model with voice command support. Includes a free 64GB memory card and free installation.",
    features: ["4K 3-channel recording", "Voice command support", "Flat screen model", "Free 64GB memory card", "Free installation"],
    vehicleTypes: ALL, brand: "Lingdu", faqs: DASH_FAQ, image: IMG.dashcam, imageAlt: "Dashcam (illustrative)", internalPrice: "$169",
  },
  {
    slug: "lingdu-ld02-5k", name: "Lingdu LD02 5K", category: "dashcams",
    shortDescription: "5K 3-channel dashcam with voice command and GPS.",
    longDescription: "The Lingdu LD02 records in 5K across three channels and adds voice command and GPS. Includes a free 64GB memory card and free installation.",
    features: ["5K 3-channel recording", "Voice command support", "GPS", "Free 64GB memory card", "Free installation"],
    vehicleTypes: ALL, brand: "Lingdu", faqs: DASH_FAQ, image: IMG.dashcam, imageAlt: "Dashcam (illustrative)", internalPrice: "$199",
  },
  {
    slug: "azdome-550-pro", name: "AzDome 550 PRO", category: "dashcams",
    shortDescription: "4K front / 1080p rear, 3.18\" IPS screen, 24H parking mode and 5GHz WiFi.",
    longDescription: "The AzDome 550 PRO pairs 4K front and 1080p rear recording with a 3.18\" IPS screen, 150° wide angle, WDR, 24-hour parking mode, G-sensor, built-in 5GHz WiFi and app control.",
    features: ["4K front & 1080p rear", "3.18\" IPS screen", "150° wide angle", "WDR", "24H parking mode", "G-sensor", "Built-in 5GHz WiFi", "App control"],
    vehicleTypes: ALL, brand: "AzDome", faqs: DASH_FAQ, image: IMG.dashcam, imageAlt: "Dashcam (illustrative)", internalPrice: "$229",
  },
  {
    slug: "azdome-m580-3ch-5k", name: "AzDome M580 3CH 5K", category: "dashcams",
    shortDescription: "5K 3-channel dashcam with free 64GB card, installation and 365-day warranty.",
    longDescription: "The AzDome M580 is a 5K 3-channel dashcam supplied with a free 64GB memory card, free installation and a 365-day warranty.",
    features: ["5K 3-channel recording", "Free 64GB memory card", "Free installation", "365-day warranty"],
    vehicleTypes: ALL, brand: "AzDome", warranty: "365 days", faqs: DASH_FAQ,
    image: IMG.dashcam, imageAlt: "Dashcam (illustrative)", internalPrice: "$289",
  },
  {
    slug: "mirror-dashcam", name: "Mirror Dashcam", category: "dashcams",
    shortDescription: "Rear-view mirror dashcam with free installation and free SD card.",
    longDescription: "A dashcam built into a rear-view mirror display for a clean, integrated look. Includes free installation and a free SD card.",
    features: ["Mirror-style display", "Free installation", "Free SD card"],
    vehicleTypes: ALL, faqs: DASH_FAQ, image: IMG.dashcam, imageAlt: "Car interior rear-view area (illustrative)",
    internalPrice: "Reg $250 · offer $199",
  },
  {
    slug: "dashcam-installation-add-ons", name: "Dashcam Installation & Add-ons", category: "dashcams",
    shortDescription: "Install your own camera, hardwire for 24/7 recording, parking mode and card upgrades.",
    longDescription: "Already have a dashcam? We install customer cameras with plug-and-play wiring. For 24/7 recording we offer two hardwire methods: Fusebox hardwire for a clean, permanent power supply, or OBD hardwire with an on/off button for surveillance mode. Parking mode, new fuses and 64GB card upgrades are available. 128GB cards are not available.",
    features: ["Wires fully hidden", "About 40 minutes for a standard install"],
    options: ["Customer camera installation (plug & play)", "Fusebox hardwire — permanent power for 24/7 recording", "OBD hardwire — on/off button for surveillance mode", "24/7 parking mode (with a dashcam purchased from us)", "New fuse", "64GB memory card upgrade"],
    vehicleTypes: ALL, faqs: DASH_FAQ, image: IMG.dashcam, imageAlt: "Dashcam wiring installation (illustrative)",
    internalPrice: "Install only $50 · Hardwire (fuse/OBD) $79 · Parking mode +$39 · New fuse $40–50 · 64GB +$15",
  },

  /* ───────── CARPLAY & CAMERAS ───────── */
  {
    slug: "portable-carplay", name: "Portable CarPlay / Android Auto", category: "carplay-cameras", isFeatured: true,
    shortDescription: "Portable Apple CarPlay & Android Auto screen with built-in 4K dashcam and reverse camera.",
    longDescription: "A portable CarPlay screen supporting both Apple CarPlay and Android Auto, with a built-in 4K dashcam and a backup camera that also works as a reverse camera. Includes free installation with reverse camera setup, a free 64GB memory card and a 365-day warranty.",
    features: ["Apple CarPlay & Android Auto", "Built-in 4K dashcam", "Backup / reverse camera", "Free installation with reverse camera setup", "Free 64GB memory card", "365-day warranty"],
    vehicleTypes: ALL, warranty: "365 days", image: IMG.interior, imageAlt: "Car interior at night (illustrative)",
    internalPrice: "Reg $300 · offer $250",
  },
  {
    slug: "carplay-installation", name: "CarPlay Installation", category: "carplay-cameras",
    shortDescription: "Universal or dashboard-standard installation, including backup camera setup.",
    longDescription: "Choose a universal installation or a dashboard / company-standard installation. Both include backup and reverse camera settings.",
    options: ["Universal installation", "Dashboard / company-standard installation"],
    vehicleTypes: ALL, image: IMG.interior, imageAlt: "Car dashboard (illustrative)", internalPrice: "Universal $150 · Dashboard $180",
  },
  {
    slug: "backup-camera-installation", name: "Backup Camera Installation", category: "carplay-cameras",
    shortDescription: "Professional backup camera installation.",
    longDescription: "Add a backup camera to your vehicle for safer reversing and parking, installed with clean wiring.",
    vehicleTypes: ALL, image: IMG.blackCar, imageAlt: "Rear of a car", internalPrice: "$100",
  },
  {
    slug: "carplay-power-adapter", name: "CarPlay Power Adapter", category: "carplay-cameras",
    shortDescription: "Power adapter for portable CarPlay units.",
    longDescription: "A power adapter for portable CarPlay screens, available on its own.",
    vehicleTypes: ALL, image: IMG.interior, imageAlt: "Car interior (illustrative)", internalPrice: "$30",
  },

  /* ───────── LIGHTING ───────── */
  {
    slug: "headlight-tint", name: "Headlight Tint / Smoke", category: "lighting", calendarKey: "mon-thu", bookingNote: MON_THU,
    shortDescription: "Smoked headlight finish for sedans and SUVs.",
    longDescription: "Give your headlights a smoked, darker look. Available for sedans and SUVs, priced per light.",
    options: ["Sedan", "SUV"], vehicleTypes: ["Sedan", "Midsize SUV / Truck", "Extended SUV / Minivan"],
    image: IMG.light, imageAlt: "Close-up of a modern car headlight", internalPrice: "Sedan $60/light · SUV $80/light",
  },
  {
    slug: "tail-light-tint", name: "Tail Light Tint / Smoke", category: "lighting", calendarKey: "mon-thu", bookingNote: MON_THU,
    shortDescription: "Smoked tail light finish for sedans and SUVs.",
    longDescription: "A bold smoked finish for your tail lights. Available for sedans and SUVs, priced per light.",
    options: ["Sedan", "SUV"], vehicleTypes: ["Sedan", "Midsize SUV / Truck", "Extended SUV / Minivan"],
    image: IMG.tailLight, imageAlt: "Red car tail light at night", internalPrice: "Sedan $60/light · SUV $80/light",
  },
  {
    slug: "headlight-restoration", name: "Headlight Restoration", category: "lighting",
    shortDescription: "Restore cloudy, yellowed headlights — both headlights.",
    longDescription: "Cloudy or yellowed headlights restored for better clarity and a cleaner look. Priced for both headlights.",
    vehicleTypes: ALL, image: IMG.light, imageAlt: "Clear car headlight", internalPrice: "$80 both headlights",
  },
  {
    slug: "wheel-lights", name: "Wheel Lights", category: "lighting", bookingNote: APPT,
    shortDescription: "LED wheel lights — by appointment.",
    longDescription: "LED wheel light installation. Please book an appointment so the team can confirm fitment for your vehicle.",
    vehicleTypes: ALL, image: IMG.wheel, imageAlt: "Illuminated car wheel",
  },
  {
    slug: "ambient-lights", name: "Ambient Lights", category: "lighting", needsReview: true, isActive: false,
    shortDescription: "Interior ambient lighting — contact us for details.",
    longDescription: "Interior ambient lighting installation. Contact us for available options for your vehicle.",
    vehicleTypes: ALL, image: IMG.interior, imageAlt: "Car interior lighting",
  },
  {
    slug: "starlight-headliner", name: "Starlight Headliner", category: "lighting", needsReview: true, isActive: false,
    shortDescription: "Starlight headliner installation — contact us for details.",
    longDescription: "Starlight headliner installation. Contact us for available options for your vehicle.",
    vehicleTypes: ALL, image: IMG.interior, imageAlt: "Starlight headliner in a car",
  },

  /* ───────── EXTERIOR ───────── */
  {
    slug: "chrome-delete", name: "Chrome Delete", category: "exterior", isFeatured: true, bookingNote: APPT,
    shortDescription: "Black out window chrome trim — per door or all four doors.",
    longDescription: "Replace shiny chrome window trim with a clean blacked-out look. Available per side door or for all four doors. Booking required.",
    options: ["Per side door", "All 4 doors"], vehicleTypes: ALL, image: IMG.blackCar, imageAlt: "Black sports car with blacked-out trim",
    internalPrice: "$50 per door · $200 for 4 doors",
  },
  {
    slug: "logo-blackout", name: "Logo Blackout", category: "exterior",
    shortDescription: "Blacked-out badges and logos.",
    longDescription: "Black out factory badges and logos for a cleaner, stealthier look. Priced per logo.",
    vehicleTypes: ALL, image: IMG.graphite, imageAlt: "Dark car front", internalPrice: "$25 each",
  },
  {
    slug: "vinyl-wraps", name: "Vinyl Wraps", category: "exterior", bookingNote: APPT, needsReview: true, isActive: false,
    shortDescription: "Vinyl wraps — by appointment, contact us for details.",
    longDescription: "Vinyl wrap work by appointment. Contact us with your vehicle and the look you want.",
    vehicleTypes: ALL, image: IMG.decal, imageAlt: "Vinyl decal being applied to a car",
  },
  {
    slug: "wheel-painting", name: "Wheel Painting", category: "exterior",
    shortDescription: "Custom wheel painting.",
    longDescription: "Change the colour of your wheels for a custom look.",
    vehicleTypes: ALL, image: IMG.wheel, imageAlt: "Custom car wheel", internalPrice: "$200",
  },
  {
    slug: "caliper-painting", name: "Caliper Painting", category: "exterior",
    shortDescription: "Brake caliper painting — priced per caliper.",
    longDescription: "Painted brake calipers add a sharp accent behind your wheels. Priced per caliper.",
    vehicleTypes: ALL, image: IMG.wheel, imageAlt: "Wheel with painted brake caliper", internalPrice: "$50 per caliper",
  },

  /* ───────── PAINT PROTECTION ───────── */
  {
    slug: "ceramic-coating-level-1", name: "Ceramic Coating — Level 1", category: "paint-protection", isFeatured: true,
    calendarKey: "mon-thu", bookingNote: `${MON_THU} Plan to leave the vehicle for one full day.`,
    shortDescription: "Entry ceramic coating with free Stage 1 paint correction.",
    longDescription: "Level 1 ceramic coating includes a free Stage 1 paint correction. Service time is approximately 4–5 hours, and we recommend leaving the vehicle for one full day for best results. The final level is selected based on the vehicle's paint condition.",
    features: ["Free Stage 1 paint correction", "Approx. 4–5 hours service time", "1 full day recommended", "3-year warranty"],
    vehicleTypes: ALL, warranty: "3 years", image: IMG.ceramic, imageAlt: "Technician polishing a red car",
    internalPrice: "Sedan $199 · Midsize $250 · Extended $300",
  },
  {
    slug: "ceramic-coating-level-2", name: "Ceramic Coating — Level 2", category: "paint-protection",
    calendarKey: "mon-thu", bookingNote: `${MON_THU} Plan to leave the vehicle for one full day.`,
    shortDescription: "Mid-level ceramic coating — final level confirmed after paint inspection.",
    longDescription: "Level 2 ceramic coating. The final level is selected based on the vehicle's paint condition. Service time is approximately 4–5 hours; we recommend leaving the vehicle for one full day.",
    features: ["Approx. 4–5 hours service time", "1 full day recommended", "3-year warranty"],
    vehicleTypes: ALL, warranty: "3 years", image: IMG.ceramic, imageAlt: "Car paint being polished",
    internalPrice: "Sedan $400 · Midsize $400 · Extended $500",
  },
  {
    slug: "ceramic-coating-level-3", name: "Ceramic Coating — Level 3", category: "paint-protection",
    calendarKey: "mon-thu", bookingNote: `${MON_THU} Plan to leave the vehicle for one full day.`,
    shortDescription: "Top-level ceramic coating — final level confirmed after paint inspection.",
    longDescription: "Level 3 ceramic coating. The final level is selected based on the vehicle's paint condition. Service time is approximately 4–5 hours; we recommend leaving the vehicle for one full day.",
    features: ["Approx. 4–5 hours service time", "1 full day recommended", "3-year warranty"],
    vehicleTypes: ALL, warranty: "3 years", image: IMG.ceramic, imageAlt: "Glossy car paint",
    internalPrice: "Sedan $550–600 · Midsize $550–600 · Extended $700",
  },
  {
    slug: "full-body-ppf", name: "Full Body PPF", category: "paint-protection", isFeatured: true, bookingNote: APPT,
    shortDescription: "XPEL Black paint protection film over the entire vehicle.",
    longDescription: "Full body coverage with XPEL Black paint protection film to guard against rock chips, scratches and road debris. Share your vehicle type and contact number — our shop team will call you with an exact quote.",
    features: ["XPEL Black PPF", "Full vehicle coverage", "8–10 year warranty"],
    vehicleTypes: ALL, brand: "XPEL", warranty: "8–10 years", image: IMG.ppf, imageAlt: "Paint protection film being applied",
    internalPrice: "Sedan $2500 · Midsize $2800 · Extended $3500",
  },
  {
    slug: "front-half-ppf", name: "Front Half PPF", category: "paint-protection", bookingNote: APPT,
    shortDescription: "XPEL Black PPF on the front-half impact zones.",
    longDescription: "Partial front coverage with XPEL Black PPF on the areas most exposed to chips. Share your vehicle type and contact number — our shop team will call you with an exact quote.",
    features: ["XPEL Black PPF", "8–10 year warranty"], vehicleTypes: ALL, brand: "XPEL", warranty: "8–10 years",
    image: IMG.ppf, imageAlt: "PPF on a car front", internalPrice: "Sedan $899 · Midsize $999 · Extended $1200",
  },
  {
    slug: "full-front-ppf", name: "Full Front PPF", category: "paint-protection", bookingNote: APPT,
    shortDescription: "XPEL Black PPF across the full front end.",
    longDescription: "Full front-end coverage with XPEL Black PPF. Share your vehicle type and contact number — our shop team will call you with an exact quote.",
    features: ["XPEL Black PPF", "8–10 year warranty"], vehicleTypes: ALL, brand: "XPEL", warranty: "8–10 years",
    image: IMG.ppf, imageAlt: "PPF installation on a headlight", internalPrice: "Sedan $899 · Midsize $999 · Extended $1200",
  },
  {
    slug: "individual-panel-ppf", name: "Individual Panel PPF", category: "paint-protection", bookingNote: APPT,
    shortDescription: "XPEL Black PPF for the hood, roof, bumpers or door cups.",
    longDescription: "Protect specific panels with XPEL Black PPF. Share your vehicle type and contact number — our shop team will call you with an exact quote.",
    features: ["XPEL Black PPF", "8–10 year warranty"],
    options: ["Hood", "Roof", "Front bumper", "Rear bumper", "Door cups (set of 4)"],
    vehicleTypes: ALL, brand: "XPEL", warranty: "8–10 years", image: IMG.ppf, imageAlt: "Film applied to a car panel",
    internalPrice: "Door cups $79 · Bumper $300/350/400 · Hood $300/350/400 · Roof $300/400/450 (sedan/SUV/ext)",
  },

  /* ───────── TIRES ───────── */
  {
    slug: "tire-swap", name: "Tire Swap (On-Rims)", category: "tires", isFeatured: true, bookingNote: APPT,
    shortDescription: "Seasonal swap for tires already mounted on rims. Balancing available as an add-on.",
    longDescription: "A swap is for tires that are already mounted on rims. Balancing is not included but can be added.",
    options: ["Sedan", "Midsize SUV", "Extended SUV", "Balancing add-on"], vehicleTypes: ALL,
    faqs: TIRE_FAQ, image: IMG.tire, imageAlt: "Technician working on a car tire",
    internalPrice: "Sedan $40 · Midsize $50 · Extended $60 · balancing +$20",
  },
  {
    slug: "tire-change", name: "Tire Change (Off-Rims)", category: "tires", bookingNote: APPT,
    shortDescription: "Mounting tires that are not on rims — balancing included.",
    longDescription: "A change is for tires that are not on rims and need to be mounted. Balancing is included.",
    features: ["Balancing included"], options: ["Sedan", "Midsize SUV", "Extended SUV"], vehicleTypes: ALL,
    faqs: TIRE_FAQ, image: IMG.tire, imageAlt: "Tire being mounted", internalPrice: "Sedan $79 · Midsize $89 · Extended $99",
  },
  {
    slug: "tire-rotation", name: "Tire Rotation", category: "tires", bookingNote: APPT,
    shortDescription: "On-rims or off-rims tire rotation for sedans and SUVs.",
    longDescription: "Rotate your tires to even out wear. Available for on-rims and off-rims setups.",
    options: ["On-rims", "Off-rims"], vehicleTypes: ALL, faqs: TIRE_FAQ, image: IMG.tire, imageAlt: "Car wheel and tire",
    internalPrice: "Sedan on $40 / off $80 · SUV on $50 / off $100",
  },
  {
    slug: "wheel-balancing", name: "Wheel Balancing", category: "tires",
    shortDescription: "Wheel balancing priced per tire.",
    longDescription: "Balancing for a smoother ride and even tire wear, priced per tire.",
    vehicleTypes: ALL, faqs: TIRE_FAQ, image: IMG.tire, imageAlt: "Wheel balancing", internalPrice: "$15 per tire",
  },
  {
    slug: "truck-van-tire-service", name: "Truck & Van Tire Service", category: "tires", bookingNote: APPT,
    shortDescription: "Tire services for trucks and vans — by appointment.",
    longDescription: "We handle tire work for trucks and vans by appointment. Book online or contact us with your vehicle details.",
    vehicleTypes: ["Midsize SUV / Truck", "Extended SUV / Minivan"], faqs: TIRE_FAQ, image: IMG.tire, imageAlt: "Truck tire service",
  },

  /* ───────── REPAIRS ───────── */
  { slug: "tire-puncture-repair", name: "Tire Puncture Repair", category: "repairs",
    shortDescription: "Fix a punctured tire.", longDescription: "Puncture repair to get you back on the road.",
    vehicleTypes: ALL, image: IMG.tire, imageAlt: "Tire repair", internalPrice: "$30–40" },
  { slug: "air-valve-replacement", name: "Air Valve Replacement", category: "repairs",
    shortDescription: "Replace a leaking or damaged tire valve.", longDescription: "Replacement of damaged or leaking tire air valves.",
    vehicleTypes: ALL, image: IMG.wheel, imageAlt: "Tire valve", internalPrice: "$40" },
  { slug: "bent-steel-rim-repair", name: "Bent Steel Rim Repair", category: "repairs",
    shortDescription: "Straighten bent steel rims — priced per rim.", longDescription: "Repair for bent steel rims, priced per rim.",
    vehicleTypes: ALL, image: IMG.wheel, imageAlt: "Steel wheel rim", internalPrice: "$50 per rim" },
  { slug: "tire-sealant", name: "Tire Sealant", category: "repairs",
    shortDescription: "Tire sealant application — priced per tire.", longDescription: "Sealant applied to help prevent slow leaks, priced per tire.",
    vehicleTypes: ALL, image: IMG.tire, imageAlt: "Car tire", internalPrice: "$40 per tire" },
  { slug: "mobile-puncture-service", name: "Mobile Puncture Service", category: "repairs",
    bookingNote: "Available near the shop only. Please contact us first to confirm.",
    shortDescription: "Puncture service near the shop — contact us first to confirm.",
    longDescription: "We can come to you for puncture repair when you're near the shop. Cost depends on distance, so please contact us first to confirm availability.",
    vehicleTypes: ALL, image: IMG.tire, imageAlt: "Roadside tire repair", internalPrice: "$100–150 by distance" },
  { slug: "lug-nut-removal", name: "Rusty / Bad Lug Nut Removal", category: "repairs",
    shortDescription: "Removal of seized, rusty or damaged lug nuts.", longDescription: "Seized, rusty or rounded lug nuts removed safely, priced per nut.",
    vehicleTypes: ALL, image: IMG.wheel, imageAlt: "Wheel lug nuts", internalPrice: "$20 each" },
  { slug: "lock-lug-nut-key-removal", name: "Broken Lock Lug Nut Key Removal", category: "repairs",
    shortDescription: "Remove locking lug nuts when the key is broken or missing.", longDescription: "Removal of locking lug nuts when the key is broken.",
    vehicleTypes: ALL, image: IMG.wheel, imageAlt: "Locking wheel nut", internalPrice: "$20" },
];

/** A dedicated photo in public/images/products/<slug>.* (see scripts/sync-product-images.mjs) replaces the shared category image. */
export const SEED_PRODUCTS: SeedProduct[] = BASE_PRODUCTS.map((p) => {
  const own = (PRODUCT_IMAGES as Record<string, string>)[p.slug];
  return own ? { ...p, image: own, imageAlt: p.name } : p;
});

export type SeedOffer = {
  slug: string;
  title: string;
  description: string;
  image: string;
  products: string[];
  internalNotes: string;
};

const OFFER_COPY = "Limited-time offer, contact us for details.";

export const SEED_OFFERS: SeedOffer[] = [
  { slug: "tint-dashcam-combo", title: "Ceramic Tint + 3-Channel HD Dashcam Combo", image: IMG.dashcam,
    description: `Ceramic tint on four windows plus a professionally installed 3-channel HD dashcam. ${OFFER_COPY}`,
    products: ["ceramic-tint", "hd-3-channel-dashcam"],
    internalNotes: "Holiday offer · Sedan $119 · SUV $139 · back windshield +$20" },
  { slug: "halloween-front-door-tint", title: "Halloween Front-Door Tint Offer", image: IMG.tint,
    description: `Seasonal offer on front two-door ceramic tint for sedans and SUVs. ${OFFER_COPY}`,
    products: ["ceramic-tint"], internalNotes: "Sedan $39 · SUV $49 (alt script: $60 / $70) — confirm with channel" },
  { slug: "fifa-windshield-offer", title: "FIFA Front Windshield Offer", image: IMG.tint,
    description: `Seasonal offer on front windshield tint. ${OFFER_COPY}`,
    products: ["front-windshield-tint"], internalNotes: "Sedan $120 · SUV $130" },
  { slug: "dashcam-deal", title: "Dashcam Deal with Free Installation", image: IMG.dashcam,
    description: `Basic 1080p 3-channel dashcam with free plug-and-play installation, WiFi, 1-year warranty and a complimentary 32GB card. ${OFFER_COPY}`,
    products: ["hd-3-channel-dashcam"], internalNotes: "$69 deal" },
];
