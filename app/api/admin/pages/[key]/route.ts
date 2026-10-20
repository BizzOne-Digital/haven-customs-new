import { z } from "zod";
import { isResponse, requireAdminApi } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { fail, handleError, ok, parse } from "@/lib/api";
import { PAGE_DEFAULTS, isPageKey, type PageKey } from "@/lib/content";
import { PageContent } from "@/lib/models/ops";
import { getPage } from "@/lib/queries";
import { cleanupReplacedImages } from "@/lib/uploads";
import { imageUrl } from "@/lib/validation";

export const runtime = "nodejs";
type Ctx = { params: Promise<{ key: string }> };

/** Schema derived from the defaults: text fields stay text, *Image fields must be approved URLs. */
function schemaFor(key: PageKey) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const [k, v] of Object.entries(PAGE_DEFAULTS[key])) {
    if (k === "heroImageMode") shape[k] = z.enum(["photo", "cutout"]);
    else if (typeof v === "string") shape[k] = /image$/i.test(k) ? imageUrl : z.string().max(3000);
    else if (k === "values")
      shape[k] = z.array(z.object({ title: z.string().trim().min(1).max(80), text: z.string().trim().max(300) })).max(6);
    else if (k === "items")
      shape[k] = z
        .array(
          z.object({
            name: z.string().trim().min(1).max(80),
            text: z.string().trim().min(1).max(1000),
            service: z.string().max(80).optional(),
            approved: z.boolean(),
          })
        )
        .max(50);
  }
  return z.object(shape).partial().strict();
}

export async function GET(req: Request, ctx: Ctx) {
  const admin = await requireAdminApi(req);
  if (isResponse(admin)) return admin;
  const { key } = await ctx.params;
  if (!isPageKey(key)) return fail("Unknown page", 404);
  return ok({ data: await getPage(key), defaults: PAGE_DEFAULTS[key] });
}

export async function PUT(req: Request, ctx: Ctx) {
  const admin = await requireAdminApi(req);
  if (isResponse(admin)) return admin;
  try {
    const { key } = await ctx.params;
    if (!isPageKey(key)) return fail("Unknown page", 404);
    await connectDB();
    const data = await parse(req, schemaFor(key));
    const before = await PageContent.findOne({ key }).lean();
    await PageContent.findOneAndUpdate({ key }, { $set: { data } }, { upsert: true });
    // Old images are removed only after the new content is saved, and only if unreferenced.
    await cleanupReplacedImages(before?.data, data);
    return ok({ data: await getPage(key) });
  } catch (err) {
    return handleError(err);
  }
}
