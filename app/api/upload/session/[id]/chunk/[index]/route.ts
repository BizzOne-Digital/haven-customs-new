import { isResponse, requireAdminApi } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/api";
import { UploadChunk } from "@/lib/models/ops";
import { ownedSession } from "@/lib/uploadSession";

export const runtime = "nodejs";
type Ctx = { params: Promise<{ id: string; index: string }> };

/** Upload one chunk (raw bytes). Idempotent: re-sending the same index replaces it. */
export async function PUT(req: Request, ctx: Ctx) {
  const admin = await requireAdminApi(req);
  if (isResponse(admin)) return admin;
  try {
    const { id, index: indexStr } = await ctx.params;
    if (!/^\d{1,3}$/.test(indexStr)) return fail("Invalid chunk index");
    const index = Number(indexStr);
    await connectDB();
    const session = await ownedSession(id, admin.id);
    if (!session) return fail("Upload session not found or expired", 404);
    if (index >= session.chunkCount) return fail("Chunk index out of range");

    const isLast = index === session.chunkCount - 1;
    const expected = isLast ? session.totalSize - session.chunkSize * (session.chunkCount - 1) : session.chunkSize;
    const declared = Number(req.headers.get("content-length") ?? 0);
    if (declared > session.chunkSize) return fail("Chunk too large", 413);

    const buf = Buffer.from(await req.arrayBuffer());
    if (buf.length !== expected) return fail(`Chunk ${index} must be ${expected} bytes`, 400);

    await UploadChunk.updateOne(
      { sessionId: id, index },
      { $set: { size: buf.length, data: buf, expiresAt: session.expiresAt } },
      { upsert: true }
    );
    return ok({ index, received: buf.length });
  } catch (err) {
    return handleError(err);
  }
}
