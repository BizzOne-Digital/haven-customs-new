import { isResponse, requireAdminApi } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { handleError, ok } from "@/lib/api";
import { StoredUpload } from "@/lib/models/ops";
import { countReferences, MANAGED_PREFIX } from "@/lib/uploads";

export const runtime = "nodejs";

/**
 * Remove abandoned uploads: unreferenced and older than 24h (so an image uploaded
 * into a form that hasn't been saved yet is never removed).
 */
export async function POST(req: Request) {
  const admin = await requireAdminApi(req);
  if (isResponse(admin)) return admin;
  try {
    await connectDB();
    const cutoff = new Date(Date.now() - 24 * 3600_000);
    const candidates = await StoredUpload.find({ createdAt: { $lt: cutoff } }, "folder filename").lean();
    let deleted = 0;
    for (const c of candidates) {
      if ((await countReferences(`${MANAGED_PREFIX}${c.folder}/${c.filename}`)) === 0) {
        deleted += (await StoredUpload.deleteOne({ _id: c._id })).deletedCount;
      }
    }
    return ok({ deleted });
  } catch (err) {
    return handleError(err);
  }
}
