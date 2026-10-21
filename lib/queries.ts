import "server-only";
import { IMG, resolveImageUrl } from "./images";
import { connectDB } from "./db";
import { DEFAULT_SETTINGS } from "./constants";
import { PAGE_DEFAULTS, type PageKey } from "./content";
import { Category, GalleryItem, Offer, Product } from "./models/catalog";
import { PageContent, SiteSettings } from "./models/ops";

/* ───────────── Public DTOs — explicit allow-lists, never spread documents ───────────── */

export type PublicImage = { url: string; alt: string };
export type PublicCategory = {
  id: string; name: string; slug: string; description: string; image: string; icon: string;
};
export type PublicProduct = {
  id: string; name: string; slug: string;
  category: { name: string; slug: string } | null;
  shortDescription: string; longDescription: string;
  features: string[]; options: string[]; vehicleTypes: string[];
  brand: string; warranty: string; bookingNote: string; calendarKey: string;
  faqs: { q: string; a: string }[];
  images: PublicImage[];
  isFeatured: boolean;
};
export type PublicOffer = {
  id: string; title: string; slug: string; description: string; image: string;
  products: { name: string; slug: string }[];
  endsAt: string | null;
};
export type PublicGalleryItem = { id: string; image: string; alt: string; caption: string; category: string };
export type PublicSettings = typeof DEFAULT_SETTINGS & { bookingIntro: string };

/* eslint-disable @typescript-eslint/no-explicit-any */
const toCategory = (c: any): PublicCategory => ({
  id: String(c._id), name: c.name, slug: c.slug, description: c.description ?? "",
  image: resolveImageUrl(c.image), icon: c.icon ?? "sparkles",
});

const toProduct = (p: any): PublicProduct => ({
  id: String(p._id), name: p.name, slug: p.slug,
  category: p.category && typeof p.category === "object" && "slug" in p.category
    ? { name: p.category.name, slug: p.category.slug } : null,
  shortDescription: p.shortDescription ?? "", longDescription: p.longDescription ?? "",
  features: [...(p.features ?? [])], options: [...(p.options ?? [])], vehicleTypes: [...(p.vehicleTypes ?? [])],
  brand: p.brand ?? "", warranty: p.warranty ?? "", bookingNote: p.bookingNote ?? "", calendarKey: p.calendarKey ?? "",
  faqs: (p.faqs ?? []).map((f: any) => ({ q: f.q, a: f.a })),
  images: (p.images ?? []).map((i: any) => ({ url: resolveImageUrl(i.url), alt: i.alt ?? "" })),
  isFeatured: Boolean(p.isFeatured),
});
/* eslint-enable @typescript-eslint/no-explicit-any */

const PUBLIC_PRODUCT_FIELDS =
  "name slug category shortDescription longDescription features options vehicleTypes brand warranty bookingNote calendarKey faqs images isFeatured sortOrder";

/* ───────────── Queries ───────────── */

export async function getSettings(): Promise<PublicSettings> {
  try {
    await connectDB();
    const s = await SiteSettings.findOne({ key: "site" }).lean();
    const merged = { ...DEFAULT_SETTINGS, bookingIntro: "" };
    if (s) {
      for (const k of Object.keys(merged) as (keyof PublicSettings)[]) {
        const v = (s as Record<string, unknown>)[k];
        if (typeof v === "string" && (v.trim() || k === "email")) (merged as Record<string, string>)[k] = v;
      }
    }
    merged.phoneHref = `tel:+${merged.phone.replace(/\D/g, "")}`;
    return merged;
  } catch {
    return { ...DEFAULT_SETTINGS, bookingIntro: "" };
  }
}

export async function getPage<K extends PageKey>(key: K): Promise<(typeof PAGE_DEFAULTS)[K]> {
  const defaults = PAGE_DEFAULTS[key];
  try {
    await connectDB();
    const doc = await PageContent.findOne({ key }).lean();
    const merged = { ...defaults, ...((doc?.data as object) ?? {}) } as Record<string, unknown>;
    for (const field of Object.keys(merged)) {
      if (/image$/i.test(field) && typeof merged[field] === "string") {
        merged[field] = resolveImageUrl(merged[field]);
      }
    }
    // Old saved defaults may still specify photo mode for the original stock car.
    if (key === "home" && merged.heroImage === IMG.heroCar) merged.heroImageMode = "cutout";
    return merged as (typeof PAGE_DEFAULTS)[K];
  } catch {
    return defaults;
  }
}

async function getCategoriesUnsafe(): Promise<PublicCategory[]> {
  await connectDB();
  const cats = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();
  return cats.map(toCategory);
}

async function getProductsUnsafe(filter: { categories?: string[]; vehicle?: string; q?: string; featured?: boolean } = {}) {
  await connectDB();
  const activeCats = await Category.find({ isActive: true }, { _id: 1, slug: 1 }).lean();
  let catIds = activeCats.map((c) => c._id);
  if (filter.categories?.length) {
    catIds = activeCats.filter((c) => filter.categories!.includes(c.slug)).map((c) => c._id);
  }
  const query: Record<string, unknown> = { isActive: true, category: { $in: catIds } };
  if (filter.vehicle) query.vehicleTypes = filter.vehicle;
  if (filter.featured) query.isFeatured = true;
  if (filter.q) {
    const rx = new RegExp(filter.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").slice(0, 80), "i");
    query.$or = [{ name: rx }, { shortDescription: rx }, { brand: rx }, { options: rx }];
  }
  const items = await Product.find(query, PUBLIC_PRODUCT_FIELDS)
    .populate("category", "name slug sortOrder")
    .sort({ sortOrder: 1, name: 1 })
    .lean();
  return items
    .map(toProduct)
    .sort((a, b) => {
      const ca = activeCats.findIndex((c) => c.slug === a.category?.slug);
      const cb = activeCats.findIndex((c) => c.slug === b.category?.slug);
      return ca - cb;
    });
}

async function getProductBySlugUnsafe(slug: string) {
  await connectDB();
  const p = await Product.findOne({ slug, isActive: true }, PUBLIC_PRODUCT_FIELDS).populate("category", "name slug isActive").lean();
  if (!p) return null;
  const cat = p.category as unknown as { isActive?: boolean } | null;
  if (!cat || cat.isActive === false) return null;
  return toProduct(p);
}

export async function getRelatedProducts(product: PublicProduct, limit = 3) {
  if (!product.category) return [];
  const all = await getProducts({ categories: [product.category.slug] });
  return all.filter((p) => p.slug !== product.slug).slice(0, limit);
}

async function getActiveProductOptionsUnsafe() {
  await connectDB();
  const items = await Product.find({ isActive: true }, "name slug category")
    .populate("category", "name slug sortOrder isActive")
    .sort({ sortOrder: 1, name: 1 })
    .lean();
  type Cat = { name?: string; slug?: string; sortOrder?: number; isActive?: boolean } | null;
  return items
    .filter((p) => (p.category as unknown as Cat)?.isActive !== false)
    .sort((a, b) => ((a.category as unknown as Cat)?.sortOrder ?? 0) - ((b.category as unknown as Cat)?.sortOrder ?? 0))
    .map((p) => {
      const cat = p.category as unknown as Cat;
      return {
        slug: p.slug,
        name: p.name,
        group: cat?.name ?? "Other",
        isTire: cat?.slug === "tires",
      };
    });
}

async function getActiveOffersUnsafe(): Promise<PublicOffer[]> {
  await connectDB();
  const now = new Date();
  const offers = await Offer.find({
    isActive: true,
    $and: [
      { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
      { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] },
    ],
  }, "title slug description image products endsAt")
    .populate("products", "name slug isActive")
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();
  return offers.map((o) => ({
    id: String(o._id), title: o.title, slug: o.slug, description: o.description ?? "", image: resolveImageUrl(o.image),
    products: ((o.products ?? []) as unknown as { name: string; slug: string; isActive?: boolean }[])
      .filter((p) => p && p.isActive !== false)
      .map((p) => ({ name: p.name, slug: p.slug })),
    endsAt: o.endsAt ? new Date(o.endsAt).toISOString() : null,
  }));
}

async function getGalleryUnsafe(): Promise<PublicGalleryItem[]> {
  await connectDB();
  const items = await GalleryItem.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 }).limit(200).lean();
  return items.map((g) => ({ id: String(g._id), image: resolveImageUrl(g.image), alt: g.alt ?? "", caption: g.caption ?? "", category: g.category ?? "General" }));
}

/* ───────────── Safe public exports ─────────────
   If the database is unreachable (e.g. MONGODB_URI missing on a deployment), public pages
   still render with empty catalog data instead of crashing. The error is logged. */

function safe<A extends unknown[], R, F>(fn: (...args: A) => Promise<R>, fallback: F, name: string) {
  return async (...args: A): Promise<R | F> => {
    try {
      return await fn(...args);
    } catch (err) {
      console.error(`[queries] ${name} failed — returning fallback`, err);
      return fallback;
    }
  };
}

export const getCategories = safe(getCategoriesUnsafe, [] as Awaited<ReturnType<typeof getCategoriesUnsafe>>, "getCategories");
export const getProducts = safe(getProductsUnsafe, [] as Awaited<ReturnType<typeof getProductsUnsafe>>, "getProducts");
export const getProductBySlug = safe(getProductBySlugUnsafe, null, "getProductBySlug");
export const getActiveProductOptions = safe(getActiveProductOptionsUnsafe, [] as Awaited<ReturnType<typeof getActiveProductOptionsUnsafe>>, "getActiveProductOptions");
export const getActiveOffers = safe(getActiveOffersUnsafe, [] as Awaited<ReturnType<typeof getActiveOffersUnsafe>>, "getActiveOffers");
export const getGallery = safe(getGalleryUnsafe, [] as Awaited<ReturnType<typeof getGalleryUnsafe>>, "getGallery");
