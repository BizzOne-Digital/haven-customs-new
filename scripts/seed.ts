/**
 * Idempotent catalog seed.
 *   npm run seed            → inserts anything missing; never overwrites admin edits
 *   npm run seed -- --force → also resets seeded records back to the brief's content
 */
import "./env";
import mongoose from "mongoose";
import { Category, GalleryItem, Offer, Product } from "../lib/models/catalog";
import { AdminSession, AdminUser, Inquiry, PageContent, RateLimit, SiteSettings, StoredUpload, UploadChunk, UploadSession } from "../lib/models/ops";
import { SEED_CATEGORIES, SEED_OFFERS, SEED_PRODUCTS } from "../lib/seed-data";
import { DEFAULT_SETTINGS } from "../lib/constants";

const force = process.argv.includes("--force");

async function upsert(model: mongoose.Model<any>, slug: string, doc: Record<string, unknown>) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const res = await model.updateOne({ slug }, force ? { $set: doc } : { $setOnInsert: doc }, { upsert: true });
  return res.upsertedCount ? "created" : force ? "reset" : "kept";
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Set MONGODB_URI in .env.local or .env first");
  await mongoose.connect(uri);
  console.log("Connected. Syncing indexes…");
  for (const m of [Category, Product, Offer, GalleryItem, Inquiry, PageContent, SiteSettings, AdminUser, AdminSession, RateLimit, StoredUpload, UploadSession, UploadChunk]) {
    await m.syncIndexes();
  }

  const tally: Record<string, number> = {};
  const count = (k: string) => (tally[k] = (tally[k] ?? 0) + 1);

  const catIds = new Map<string, mongoose.Types.ObjectId>();
  for (const [i, c] of SEED_CATEGORIES.entries()) {
    count(`category ${await upsert(Category, c.slug, { ...c, sortOrder: i * 10, isActive: true })}`);
    const doc = await Category.findOne({ slug: c.slug }, "_id").lean();
    catIds.set(c.slug, doc!._id);
  }

  const productIds = new Map<string, mongoose.Types.ObjectId>();
  for (const [i, p] of SEED_PRODUCTS.entries()) {
    const { image, imageAlt, category, ...rest } = p;
    const doc = {
      ...rest,
      category: catIds.get(category),
      images: [{ url: image, alt: imageAlt }],
      features: p.features ?? [],
      options: p.options ?? [],
      vehicleTypes: p.vehicleTypes ?? [],
      faqs: p.faqs ?? [],
      isActive: p.isActive ?? true,
      needsReview: p.needsReview ?? false,
      isFeatured: p.isFeatured ?? false,
      sortOrder: i * 10,
    };
    if (!doc.category) throw new Error(`Unknown category ${category} for ${p.slug}`);
    count(`product ${await upsert(Product, p.slug, doc)}`);
    const saved = await Product.findOne({ slug: p.slug }, "_id").lean();
    productIds.set(p.slug, saved!._id);
  }

  for (const [i, o] of SEED_OFFERS.entries()) {
    const doc = {
      ...o,
      products: o.products.map((s) => productIds.get(s)).filter(Boolean),
      isActive: false, // seasonal offers stay off until the team confirms them
      sortOrder: i * 10,
    };
    count(`offer ${await upsert(Offer, o.slug, doc)}`);
  }

  await SiteSettings.updateOne({ key: "site" }, { $setOnInsert: { key: "site", ...DEFAULT_SETTINGS, email: "" } }, { upsert: true });

  console.log("Seed complete:", tally);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
