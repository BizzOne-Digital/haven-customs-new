import { isResponse, requireAdminApi } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/api";
import { DIRECT_UPLOAD_MAX_BYTES, MAX_UPLOAD_BYTES } from "@/lib/constants";
import { rateLimit } from "@/lib/rateLimit";
import { isUploadFolder, storeImage, UploadError } from "@/lib/uploads";

export const runtime = "nodejs";

/**
 * Direct multipart upload for files comfortably below the platform request limit.
 * Larger files (up to 8MB) use the chunked flow under /api/upload/session.
 */
export async function POST(req: Request) {
  const admin = await requireAdminApi(req);
  if (isResponse(admin)) return admin;
  try {
    await connectDB();
    if (!(await rateLimit(`upload:${admin.id}`, 120, 10 * 60))) return fail("Too many uploads. Please wait a moment.", 429);

    const len = Number(req.headers.get("content-length") ?? 0);
    if (len > DIRECT_UPLOAD_MAX_BYTES + 64 * 1024) {
      return fail("File is too large for a direct upload — use the chunked upload flow.", 413);
    }

    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return fail("Expected multipart form data with a file");
    }
    const file = form.get("file");
    const folder = form.get("folder");
    if (!isUploadFolder(folder)) return fail("Invalid folder");
    if (!(file instanceof File)) return fail("No file provided");
    if (file.size === 0) return fail("File is empty");
    if (file.size > MAX_UPLOAD_BYTES) return fail("File exceeds the 8MB limit", 413);

    const buf = Buffer.from(await file.arrayBuffer());
    return ok(await storeImage(buf, folder, file.name), 201);
  } catch (err) {
    if (err instanceof UploadError) return fail(err.message, err.status);
    return handleError(err);
  }
}
