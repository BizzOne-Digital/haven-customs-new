import "server-only";
import type { Model } from "mongoose";
import { z, type ZodTypeAny } from "zod";
import { requireAdminApi, isResponse } from "./auth";
import { connectDB } from "./db";
import { fail, handleError, ok, parse } from "./api";
import { cleanupReplacedImages } from "./uploads";
import { reorderSchema, slugify } from "./validation";

type Ctx = { params: Promise<{ id: string }> };

type Options = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any>;
  schema: ZodTypeAny;
  /** Field the slug is generated from when none is given. */
  slugFrom?: string;
  /** Extra admin-only fields to include (select:false fields). */
  adminSelect?: string;
  populate?: string;
  searchFields?: string[];
  defaultSort?: Record<string, 1 | -1>;
};

async function uniqueSlug(model: Model<unknown>, base: string, excludeId?: string) {
  const root = slugify(base) || "item";
  let candidate = root;
  for (let i = 2; i < 200; i++) {
    const exists = await model.exists({ slug: candidate, ...(excludeId ? { _id: { $ne: excludeId } } : {}) });
    if (!exists) return candidate;
    candidate = `${root}-${i}`;
  }
  return `${root}-${Date.now()}`;
}

/** Admin-only REST handlers shared by products, categories, offers and gallery. */
export function crud(opts: Options) {
  const { model, schema, slugFrom, adminSelect = "", populate, searchFields = [], defaultSort = { sortOrder: 1, createdAt: -1 } } = opts;
  const select = adminSelect ? `+${adminSelect.split(" ").join(" +")}` : "";

  async function list(req: Request) {
    const admin = await requireAdminApi(req);
    if (isResponse(admin)) return admin;
    try {
      await connectDB();
      const url = new URL(req.url);
      const q = url.searchParams.get("q")?.trim();
      const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
      const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit") ?? 50)));
      const filter: Record<string, unknown> = {};
      if (q && searchFields.length) {
        const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").slice(0, 80), "i");
        filter.$or = searchFields.map((f) => ({ [f]: rx }));
      }
      for (const key of ["category", "isActive", "needsReview", "isFeatured"]) {
        const v = url.searchParams.get(key);
        if (v === null || v === "") continue;
        filter[key] = v === "true" ? true : v === "false" ? false : v;
      }
      let query = model.find(filter).select(select).sort(defaultSort).skip((page - 1) * limit).limit(limit);
      if (populate) query = query.populate(populate, "name slug");
      const [items, total] = await Promise.all([query.lean(), model.countDocuments(filter)]);
      return ok({ items, total, page, limit });
    } catch (err) {
      return handleError(err);
    }
  }

  async function create(req: Request) {
    const admin = await requireAdminApi(req);
    if (isResponse(admin)) return admin;
    try {
      await connectDB();
      const data = await parse(req, schema);
      if (slugFrom) data.slug = await uniqueSlug(model, data.slug || data[slugFrom]);
      const doc = await model.create(data);
      return ok({ item: doc.toObject() }, 201);
    } catch (err) {
      return handleError(err);
    }
  }

  async function get(req: Request, ctx: Ctx) {
    const admin = await requireAdminApi(req);
    if (isResponse(admin)) return admin;
    try {
      await connectDB();
      const { id } = await ctx.params;
      const item = await model.findById(id).select(select).lean();
      if (!item) return fail("Not found", 404);
      return ok({ item });
    } catch (err) {
      return handleError(err);
    }
  }

  async function update(req: Request, ctx: Ctx) {
    const admin = await requireAdminApi(req);
    if (isResponse(admin)) return admin;
    try {
      await connectDB();
      const { id } = await ctx.params;
      const before = await model.findById(id).select(select).lean();
      if (!before) return fail("Not found", 404);
      const body = (await parse(req, schema)) as Record<string, unknown>;
      if (slugFrom) body.slug = await uniqueSlug(model, (body.slug as string) || (body[slugFrom] as string), id);
      const item = await model.findByIdAndUpdate(id, body, { new: true, runValidators: true }).select(select).lean();
      // Only after the new reference is saved, remove images that are no longer used anywhere.
      await cleanupReplacedImages(before, item);
      return ok({ item });
    } catch (err) {
      return handleError(err);
    }
  }

  /** Partial update for toggles (isActive/isFeatured) without re-validating the whole document. */
  async function patch(req: Request, ctx: Ctx) {
    const admin = await requireAdminApi(req);
    if (isResponse(admin)) return admin;
    try {
      await connectDB();
      const { id } = await ctx.params;
      const body = (await parse(req, z.object({}).passthrough())) as Record<string, unknown>;
      const allowed: Record<string, boolean> = {};
      for (const k of ["isActive", "isFeatured", "needsReview"]) if (typeof body[k] === "boolean") allowed[k] = body[k] as boolean;
      if (!Object.keys(allowed).length) return fail("Nothing to update");
      const item = await model.findByIdAndUpdate(id, allowed, { new: true }).lean();
      if (!item) return fail("Not found", 404);
      return ok({ item });
    } catch (err) {
      return handleError(err);
    }
  }

  async function remove(req: Request, ctx: Ctx) {
    const admin = await requireAdminApi(req);
    if (isResponse(admin)) return admin;
    try {
      await connectDB();
      const { id } = await ctx.params;
      const before = await model.findByIdAndDelete(id).lean();
      if (!before) return fail("Not found", 404);
      await cleanupReplacedImages(before, {});
      return ok({ deleted: id });
    } catch (err) {
      return handleError(err);
    }
  }

  async function reorder(req: Request) {
    const admin = await requireAdminApi(req);
    if (isResponse(admin)) return admin;
    try {
      await connectDB();
      const { ids } = await parse(req, reorderSchema);
      await model.bulkWrite(ids.map((id, i) => ({ updateOne: { filter: { _id: id }, update: { sortOrder: i * 10 } } })));
      return ok({ reordered: ids.length });
    } catch (err) {
      return handleError(err);
    }
  }

  async function duplicate(req: Request, ctx: Ctx) {
    const admin = await requireAdminApi(req);
    if (isResponse(admin)) return admin;
    try {
      await connectDB();
      const { id } = await ctx.params;
      const src = await model.findById(id).select(select).lean<Record<string, unknown>>();
      if (!src) return fail("Not found", 404);
      const { _id, createdAt, updatedAt, __v, ...rest } = src;
      void _id; void createdAt; void updatedAt; void __v;
      const name = `${rest.name ?? rest.title ?? "Item"} (Copy)`;
      const copy: Record<string, unknown> = { ...rest, ...(rest.name ? { name } : { title: name }), isActive: false };
      if (slugFrom) copy.slug = await uniqueSlug(model, name);
      const item = await model.create(copy);
      return ok({ item: item.toObject() }, 201);
    } catch (err) {
      return handleError(err);
    }
  }

  return { list, create, get, update, patch, remove, reorder, duplicate };
}

