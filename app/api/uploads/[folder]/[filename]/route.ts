import { connectDB } from "@/lib/db";
import { StoredUpload } from "@/lib/models/ops";
import { binaryToBuffer, isUploadFolder, isValidFilename } from "@/lib/uploads";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ folder: string; filename: string }> };

const notFound = () =>
  new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain", "X-Content-Type-Options": "nosniff" } });

const STREAM_CHUNK = 256 * 1024;

/** Public, immutable image reads from MongoDB. No auth — filenames are unique per upload. */
export async function GET(_req: Request, ctx: Ctx) {
  const { folder, filename } = await ctx.params;
  // Strict whitelist: rejects traversal, separators (incl. decoded %2F / backslash) and odd names.
  if (!isUploadFolder(folder) || !isValidFilename(filename)) return notFound();

  try {
    await connectDB();
    const doc = await StoredUpload.findOne({ folder, filename }).select("+data").lean();
    if (!doc?.data) return notFound();

    const bytes = binaryToBuffer(doc.data);

    let offset = 0;
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (offset >= bytes.length) {
          controller.close();
          return;
        }
        const end = Math.min(offset + STREAM_CHUNK, bytes.length);
        controller.enqueue(new Uint8Array(bytes.subarray(offset, end)));
        offset = end;
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Length": String(bytes.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'",
      },
    });
  } catch {
    return notFound();
  }
}
