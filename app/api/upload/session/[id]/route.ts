import { isResponse, requireAdminApi } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/api";
import { UploadChunk } from "@/lib/models/ops";
import { discardSession, ownedSession } from "@/lib/uploadSession";
import { binaryToBuffer, storeImage, UploadError } from "@/lib/uploads";

export const runtime = "nodejs";
type Ctx = { params: Promise<{ id: string }> };

/** Complete: verify every chunk is present, reassemble, validate and store the final image once. */
export async function POST(req: Request, ctx: Ctx) {
  const admin = await requireAdminApi(req);
  if (isResponse(admin)) return admin;
  const { id } = await ctx.params;
  try {
    await connectDB();
    const session = await ownedSession(id, admin.id);
    if (!session) return fail("Upload session not found or expired", 404);

    const chunks = await UploadChunk.find({ sessionId: id }).sort({ index: 1 }).lean();
    if (chunks.length !== session.chunkCount || chunks.some((c, i) => c.index !== i)) {
      return fail("Upload is incomplete — some parts are missing", 409);
    }
    const buf = Buffer.concat(chunks.map((c) => binaryToBuffer(c.data)));
    if (buf.length !== session.totalSize) {
      await discardSession(id);
      return fail("Uploaded size does not match the declared size", 400);
    }
    const result = await storeImage(buf, session.folder, session.originalName ?? "");
    await discardSession(id);
    return ok(result, 201);
  } catch (err) {
    await discardSession(id).catch(() => null);
    if (err instanceof UploadError) return fail(err.message, err.status);
    return handleError(err);
  }
}

/** Abort: remove the session and any chunks. */
export async function DELETE(req: Request, ctx: Ctx) {
  const admin = await requireAdminApi(req);
  if (isResponse(admin)) return admin;
  const { id } = await ctx.params;
  await connectDB();
  if (!(await ownedSession(id, admin.id))) return fail("Upload session not found", 404);
  await discardSession(id);
  return ok({});
}
