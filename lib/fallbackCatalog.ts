import "server-only";
import { resolveImageUrl } from "./images";
import type { PublicCategory, PublicProduct } from "./queries";
import { SEED_CATEGORIES, SEED_PRODUCTS } from "./seed-data";

/**
 * Built-in catalog used when the database is unavailable or not seeded yet, so the public
 * site still lists every service. Built from the same seed data, through an explicit
 * allow-list: internalPrice is never copied.
 */

const categories: PublicCategory[] = SEED_CATEGORIES.map((c) => ({
  id: `seed-${c.slug}`,
  name: c.name,
  slug: c.slug,
  description: c.description,
  image: resolveImageUrl(c.image),
  icon: c.icon,
}));

const products: PublicProduct[] = SEED_PRODUCTS.filter((p) => p.isActive !== false).map((p) => {
  const cat = SEED_CATEGORIES.find((c) => c.slug === p.category);
  return {
    id: `seed-${p.slug}`,
    name: p.name,
    slug: p.slug,
    category: cat ? { name: cat.name, slug: cat.slug } : null,
    shortDescription: p.shortDescription,
    longDescription: p.longDescription,
    features: p.features ?? [],
    options: p.options ?? [],
    vehicleTypes: p.vehicleTypes ?? [],
    brand: p.brand ?? "",
    warranty: p.warranty ?? "",
    bookingNote: p.bookingNote ?? "",
    calendarKey: p.calendarKey ?? "",
    faqs: p.faqs ?? [],
    images: [{ url: resolveImageUrl(p.image), alt: p.imageAlt }],
    isFeatured: Boolean(p.isFeatured),
  };
});

export function fallbackCategories(): PublicCategory[] {
  return categories;
}

export function fallbackProducts(filter: { categories?: string[]; vehicle?: string; q?: string; featured?: boolean } = {}) {
  const q = filter.q?.trim().toLowerCase();
  return products.filter(
    (p) =>
      (!filter.categories?.length || (p.category && filter.categories.includes(p.category.slug))) &&
      (!filter.vehicle || p.vehicleTypes.includes(filter.vehicle)) &&
      (!filter.featured || p.isFeatured) &&
      (!q || [p.name, p.shortDescription, p.brand, ...p.options].some((t) => t.toLowerCase().includes(q)))
  );
}

export function fallbackProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug) ?? null;
}
