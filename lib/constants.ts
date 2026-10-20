export const VEHICLE_TYPES = [
  "Coupe",
  "Sedan",
  "Midsize SUV / Truck",
  "Extended SUV / Minivan",
] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const UPLOAD_FOLDERS = ["products", "gallery", "pages", "misc"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
/** Requests above this go through the chunked flow (Vercel request bodies cap at ~4.5MB). */
export const DIRECT_UPLOAD_MAX_BYTES = 3 * 1024 * 1024;
export const CHUNK_BYTES = 1024 * 1024;

export const INQUIRY_STATUSES = ["New", "Contacted", "Booked", "Closed"] as const;
export const CONTACT_METHODS = ["Call", "Text", "Email"] as const;
export const GHL_STATUSES = ["pending", "sent", "failed", "not_configured"] as const;

/** Approved Lucide icon identifiers for categories. */
export const CATEGORY_ICONS = [
  "sun",
  "shield",
  "camera",
  "monitor-smartphone",
  "lightbulb",
  "paintbrush",
  "circle-dot",
  "wrench",
  "tag",
  "sparkles",
] as const;

export const NOT_OFFERED = [
  "Rust proofing",
  "Car / floor mats",
  "Paint repair",
  "Body work",
  "Bumper repair",
  "Powder coating",
  "Car detailing",
  "Wiper blades",
  "Roof racks",
  "AC repair",
];

export const DEFAULT_SETTINGS = {
  businessName: "Haven Customs",
  phone: "+1 416-431-5255",
  phoneHref: "tel:+14164315255",
  address: "124 Production Dr, Scarborough, ON M1H 2X8, Canada",
  addressLine1: "124 Production Dr",
  addressLine2: "Scarborough, ON M1H 2X8",
  hours: "Mon – Sun · 11 AM – 8 PM",
  email: "",
  instagram: "https://instagram.com/havencustoms.ca",
  facebook: "https://facebook.com/havencustomzz",
  mapEmbedUrl:
    "https://www.google.com/maps?q=124+Production+Dr,+Scarborough,+ON+M1H+2X8&output=embed",
};
