import { z } from "zod";
import { CATEGORY_ICONS, CONTACT_METHODS, INQUIRY_STATUSES, VEHICLE_TYPES } from "./constants";

export const slugify = (v: string) =>
  v.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 80);

/** Image URL: a managed upload, a bundled /images asset, or an approved Unsplash photo. */
export const imageUrl = z
  .string()
  .trim()
  .max(500)
  .refine(
    (v) =>
      v === "" ||
      /^\/api\/uploads\/(products|gallery|pages|misc)\/\d{13}-[a-f0-9]{16}\.(jpg|png|webp|gif)$/.test(v) ||
      /^\/images\/[\w.-]+$/.test(v) ||
      /^\/uploads\//.test(v) || // legacy — rendered as placeholder until replaced
      /^https:\/\/images\.unsplash\.com\/[\w\-./?=&%]+$/.test(v),
    "Use an uploaded image or an approved image URL"
  );

const str = (max: number) => z.string().trim().max(max).default("");
const list = (max = 40) => z.array(z.string().trim().min(1).max(300)).max(max).default([]);
const slug = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes").max(80);
const objectId = z.string().regex(/^[a-f0-9]{24}$/i, "Invalid id");

/** Public copy must never carry pricing. */
const noPrice = (v: string) => !/[$€£]\s?\d|\d\s?\$|\bcad\b\s?\d/i.test(v);
const publicText = (max: number) => str(max).refine(noPrice, "Public text cannot contain prices");
const publicList = (max = 40) =>
  list(max).refine((arr) => arr.every(noPrice), "Public text cannot contain prices");

export const productSchema = z.object({
  name: z.string().trim().min(2).max(120).refine(noPrice, "Public text cannot contain prices"),
  slug: slug.optional(),
  category: objectId,
  shortDescription: publicText(200),
  longDescription: publicText(5000),
  features: publicList(),
  options: publicList(),
  vehicleTypes: z.array(z.enum(VEHICLE_TYPES)).max(4).default([]),
  brand: publicText(80),
  warranty: publicText(120),
  bookingNote: publicText(300),
  calendarKey: z.string().trim().max(40).regex(/^[a-z0-9-]*$/).default(""),
  faqs: z
    .array(z.object({ q: z.string().trim().min(1).max(300), a: z.string().trim().min(1).max(1500) }))
    .max(20)
    .default([])
    .refine((arr) => arr.every((f) => noPrice(f.q) && noPrice(f.a)), "Public text cannot contain prices"),
  images: z.array(z.object({ url: imageUrl.refine((v) => v !== ""), alt: str(200) })).max(12).default([]),
  internalPrice: str(500),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  needsReview: z.boolean().default(false),
  sortOrder: z.number().int().min(0).max(100000).default(0),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: slug.optional(),
  description: publicText(400),
  image: imageUrl.default(""),
  icon: z.enum(CATEGORY_ICONS).default("sparkles"),
  sortOrder: z.number().int().min(0).max(100000).default(0),
  isActive: z.boolean().default(true),
});

const dateish = z
  .union([z.string().datetime({ offset: true }), z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal(""), z.null()])
  .transform((v) => (v ? new Date(v) : null));

export const offerSchema = z.object({
  title: z.string().trim().min(2).max(120).refine(noPrice, "Offer titles cannot contain prices"),
  slug: slug.optional(),
  description: publicText(1000),
  image: imageUrl.default(""),
  products: z.array(objectId).max(20).default([]),
  internalNotes: str(1000),
  isActive: z.boolean().default(false),
  startsAt: dateish.default(null),
  endsAt: dateish.default(null),
  sortOrder: z.number().int().min(0).max(100000).default(0),
});

export const gallerySchema = z.object({
  image: imageUrl.refine((v) => v !== "", "Image is required"),
  alt: str(200),
  caption: publicText(200),
  category: z.string().trim().min(1).max(60).default("General"),
  sortOrder: z.number().int().min(0).max(100000).default(0),
  isActive: z.boolean().default(true),
});

export const settingsSchema = z.object({
  phone: z.string().trim().min(7).max(40),
  address: z.string().trim().min(5).max(200),
  addressLine1: z.string().trim().min(2).max(120),
  addressLine2: z.string().trim().min(2).max(120),
  hours: z.string().trim().min(2).max(120),
  email: z.union([z.literal(""), z.string().trim().toLowerCase().email().max(160)]).default(""),
  instagram: z.union([z.literal(""), z.string().url().max(300)]).default(""),
  facebook: z.union([z.literal(""), z.string().url().max(300)]).default(""),
  mapEmbedUrl: z.union([z.literal(""), z.string().url().startsWith("https://www.google.com/maps")]).default(""),
  bookingIntro: publicText(400),
});

export const inquirySchema = z
  .object({
    fullName: z.string().trim().min(2, "Please enter your name").max(120),
    phone: z
      .string()
      .trim()
      .max(40)
      .refine((v) => v.replace(/\D/g, "").length >= 10, "Please enter a valid phone number"),
    email: z.union([z.literal(""), z.string().trim().toLowerCase().email("Please enter a valid email").max(160)]).default(""),
    vehicleType: z.enum([...VEHICLE_TYPES, "Other"], { errorMap: () => ({ message: "Please choose a vehicle type" }) }),
    vehicleMake: str(60),
    vehicleModel: str(60),
    vehicleYear: z.union([z.literal(""), z.string().regex(/^(19|20)\d{2}$/, "Enter a 4-digit year")]).default(""),
    products: z.array(slug).min(1, "Choose at least one service").max(15),
    tiresOnRims: z.enum(["", "On rims", "Off rims", "Not sure"]).default(""),
    message: str(3000),
    preferredContactMethod: z.enum(CONTACT_METHODS).default("Call"),
    marketingConsent: z.boolean().default(false),
    company: z.string().max(500).optional().default(""), // honeypot — filled only by bots; dropped silently
    startedAt: z.number().optional(),
    sourceUrl: z.string().max(500).optional().default(""),
  })
  .refine((v) => v.preferredContactMethod !== "Email" || v.email !== "", {
    path: ["email"],
    message: "Add an email address to be contacted by email",
  });

export const inquiryUpdateSchema = z.object({
  status: z.enum(INQUIRY_STATUSES).optional(),
  notes: z.string().max(3000).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
});

export const reorderSchema = z.object({ ids: z.array(objectId).min(1).max(500) });

export function zodErrors(err: z.ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "form";
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}
