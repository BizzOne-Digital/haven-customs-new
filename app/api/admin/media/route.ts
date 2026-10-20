import { isResponse, requireAdminApi } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/api";
import { StoredUpload } from "@/lib/models/ops";
import { countReferences, isUploadFolder, isValidFilename, MANAGED_PREFIX } from "@/lib/uploads";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const admin = await requireAdminApi(req);
  if (isResponse(admin)) return admin;
  try {
    await connectDB();
    const url = new URL(req.url);
    const folder = url.searchParams.get("folder");
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const limit = 48;
    const filter = isUploadFolder(folder) ? { folder } : {};
    const [docs, total] = await Promise.all([
      // `data` is select:false, so binaries are never loaded here.
      StoredUpload.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      StoredUpload.countDocuments(filter),
    ]);
    const items = await Promise.all(
      docs.map(async (d) => {
        const u = `${MANAGED_PREFIX}${d.folder}/${d.filename}`;
        return {
          id: String(d._id), url: u, folder: d.folder, filename: d.filename, originalName: d.originalName,
          size: d.size, mimeType: d.mimeType, createdAt: d.createdAt, usage: await countReferences(u),
        };
      })
    );
    return ok({ items, total, page, limit });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: Request) {
  const admin = await requireAdminApi(req);
  if (isResponse(admin)) return admin;
  try {
    await connectDB();
    const url = new URL(req.url);
    const folder = url.searchParams.get("folder");
    const filename = url.searchParams.get("filename") ?? "";
    if (!isUploadFolder(folder) || !isValidFilename(filename)) return fail("Invalid file");
    const refs = await countReferences(`${MANAGED_PREFIX}${folder}/${filename}`);
    if (refs > 0) return fail(`This image is used in ${refs} place(s). Remove it from that content first.`, 409);
    const res = await StoredUpload.deleteOne({ folder, filename });
    return res.deletedCount ? ok({}) : fail("Not found", 404);
  } catch (err) {
    return handleError(err);
  }
}
