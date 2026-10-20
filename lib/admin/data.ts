import "server-only";
import { connectDB } from "../db";
import { Category, Product } from "../models/catalog";

/** Plain JSON for passing Mongo docs to client components. */
export const plain = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

export async function adminCategories() {
  await connectDB();
  const cats = await Category.find({}, "name slug").sort({ sortOrder: 1, name: 1 }).lean();
  return cats.map((c) => ({ id: String(c._id), name: c.name, slug: c.slug }));
}

export async function adminProductOptions() {
  await connectDB();
  const items = await Product.find({}, "name slug").sort({ name: 1 }).lean();
  return items.map((p) => ({ id: String(p._id), name: p.name }));
}

export async function adminProduct(id: string) {
  await connectDB();
  if (!/^[a-f0-9]{24}$/i.test(id)) return null;
  const p = await Product.findById(id).select("+internalPrice").lean();
  return p ? plain(p) : null;
}
