import { isResponse, requireAdminApi } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/api";
import { deliverToGhl } from "@/lib/inquiries";
import { Inquiry } from "@/lib/models/ops";

export const runtime = "nodejs";
type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const admin = await requireAdminApi(req);
  if (isResponse(admin)) return admin;
  try {
    await connectDB();
    const inq = await Inquiry.findById((await ctx.params).id);
    if (!inq) return fail("Not found", 404);
    if (inq.ghlStatus === "sent") return fail("This inquiry was already delivered to GHL", 409);
    await deliverToGhl(inq);
    return ok({ item: inq.toObject() });
  } catch (err) {
    return handleError(err);
  }
}
