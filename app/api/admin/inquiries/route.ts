import { isResponse, requireAdminApi } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { handleError, ok } from "@/lib/api";
import { inquiryFilter } from "@/lib/admin/inquiryFilter";
import { Inquiry } from "@/lib/models/ops";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const admin = await requireAdminApi(req);
  if (isResponse(admin)) return admin;
  try {
    await connectDB();
    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? 25)));
    const filter = inquiryFilter(url);
    const [items, total] = await Promise.all([
      Inquiry.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Inquiry.countDocuments(filter),
    ]);
    return ok({ items, total, page, limit });
  } catch (err) {
    return handleError(err);
  }
}
