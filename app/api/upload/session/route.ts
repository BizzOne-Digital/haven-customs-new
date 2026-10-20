import crypto from "crypto";
import { z } from "zod";
import { isResponse, requireAdminApi } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { fail, handleError, ok, parse } from "@/lib/api";
import { CHUNK_BYTES, MAX_UPLOAD_BYTES, UPLOAD_FOLDERS } from "@/lib/constants";
import { UploadSession } from "@/lib/models/ops";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const initSchema = z.object({
  folder: z.enum(UPLOAD_FOLDERS),
  totalSize: z.number().int().min(1).max(MAX_UPLOAD_BYTES),
  originalName: z.string().max(200).default(""),
});

/** Start a chunked upload. The session is bound to the admin and expires after 1 hour. */
export async function POST(req: Request) {
  const admin = await requireAdminApi(req);
  if (isResponse(admin)) return admin;
  try {
    await connectDB();
    if (!(await rateLimit(`upload:${admin.id}`, 120, 10 * 60))) return fail("Too many uploads. Please wait a moment.", 429);
    const { folder, totalSize, originalName } = await parse(req, initSchema);
    const sessionId = crypto.randomBytes(16).toString("hex");
    const chunkCount = Math.ceil(totalSize / CHUNK_BYTES);
    await UploadSession.create({
      sessionId,
      owner: admin.id,
      folder,
      originalName,
      totalSize,
      chunkSize: CHUNK_BYTES,
      chunkCount,
      expiresAt: new Date(Date.now() + 60 * 60_000),
    });
    return ok({ sessionId, chunkSize: CHUNK_BYTES, chunkCount }, 201);
  } catch (err) {
    return handleError(err);
  }
}
