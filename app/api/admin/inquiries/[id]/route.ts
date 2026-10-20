import { isResponse, requireAdminApi } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { fail, handleError, ok, parse } from "@/lib/api";
import { Inquiry } from "@/lib/models/ops";
import { inquiryUpdateSchema } from "@/lib/validation";

export const runtime = "nodejs";
type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const admin = await requireAdminApi(req);
  if (isResponse(admin)) return admin;
  try {
    await connectDB();
    const item = await Inquiry.findById((await ctx.params).id).lean();
    return item ? ok({ item }) : fail("Not found", 404);
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  const admin = await requireAdminApi(req);
  if (isResponse(admin)) return admin;
  try {
    await connectDB();
    const data = await parse(req, inquiryUpdateSchema);
    const item = await Inquiry.findByIdAndUpdate((await ctx.params).id, data, { new: true }).lean();
    return item ? ok({ item }) : fail("Not found", 404);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  const admin = await requireAdminApi(req);
  if (isResponse(admin)) return admin;
  try {
    await connectDB();
    const res = await Inquiry.findByIdAndDelete((await ctx.params).id);
    return res ? ok({}) : fail("Not found", 404);
  } catch (err) {
    return handleError(err);
  }
}
