import "server-only";
import crypto from "crypto";
import { MAX_UPLOAD_BYTES, UPLOAD_FOLDERS, type UploadFolder } from "./constants";
import { Category, GalleryItem, Offer, Product } from "./models/catalog";
import { PageContent, StoredUpload } from "./models/ops";

export const MANAGED_PREFIX = "/api/uploads/";
const FILENAME_RE = /^\d{13}-[a-f0-9]{16}\.(jpg|png|webp|gif)$/;

export function isUploadFolder(v: unknown): v is UploadFolder {
  return typeof v === "string" && (UPLOAD_FOLDERS as readonly string[]).includes(v);
}

export function isValidFilename(v: string) {
  return FILENAME_RE.test(v);
}

/** Detect image type from the file's magic bytes — never trust the supplied MIME/extension. */
export function sniffImage(buf: Buffer): { mime: string; ext: string } | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { mime: "image/jpeg", ext: "jpg" };
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return { mime: "image/png", ext: "png" };
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP")
    return { mime: "image/webp", ext: "webp" };
  const gif = buf.subarray(0, 6).toString("ascii");
  if (gif === "GIF87a" || gif === "GIF89a") return { mime: "image/gif", ext: "gif" };
  return null;
}

export class UploadError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export async function storeImage(buf: Buffer, folder: UploadFolder, originalName = "") {
  if (buf.length === 0) throw new UploadError("File is empty");
  if (buf.length > MAX_UPLOAD_BYTES) throw new UploadError("File exceeds the 8MB limit", 413);
  const type = sniffImage(buf);
  if (!type) throw new UploadError("Only JPEG, PNG, WebP or GIF images are allowed", 415);
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${type.ext}`;
  await StoredUpload.create({
    folder,
    filename,
    originalName: originalName.slice(0, 200),
    mimeType: type.mime,
    size: buf.length,
    data: buf,
  });
  return { success: true as const, url: `${MANAGED_PREFIX}${folder}/${filename}`, filename, size: buf.length, folder };
}

/** Parse only the exact managed URL format. Anything else (external, legacy) returns null. */
export function parseManagedUrl(url: unknown): { folder: UploadFolder; filename: string } | null {
  if (typeof url !== "string" || !url.startsWith(MANAGED_PREFIX)) return null;
  const rest = url.slice(MANAGED_PREFIX.length);
  const parts = rest.split("/");
  if (parts.length !== 2) return null;
  const [folder, filename] = parts;
  if (!isUploadFolder(folder) || !isValidFilename(filename)) return null;
  return { folder, filename };
}

/** Count references to a managed URL across all content collections. */
export async function countReferences(url: string) {
  // Page content is free-form, so scan it (a small collection).
  const pages = await PageContent.find({}, { data: 1 }).lean();
  const pagesWithUrl = pages.filter((p) => JSON.stringify(p.data ?? {}).includes(url)).length;
  const [products, categories, offers, gallery] = await Promise.all([
    Product.countDocuments({ "images.url": url }),
    Category.countDocuments({ image: url }),
    Offer.countDocuments({ image: url }),
    GalleryItem.countDocuments({ image: url }),
  ]);
  return products + categories + offers + gallery + pagesWithUrl;
}

/**
 * Delete a managed image only if nothing references it any more.
 * Call AFTER the content change that dropped the reference has been saved.
 */
export async function deleteManagedImageIfUnused(url: unknown) {
  const parsed = parseManagedUrl(url);
  if (!parsed) return false;
  if ((await countReferences(url as string)) > 0) return false;
  const res = await StoredUpload.deleteOne(parsed);
  return res.deletedCount > 0;
}

/** Collect every image URL string inside an arbitrary object (for page content diffs). */
export function collectImageUrls(value: unknown, out = new Set<string>()) {
  if (typeof value === "string") {
    if (value.startsWith(MANAGED_PREFIX)) out.add(value);
  } else if (Array.isArray(value)) value.forEach((v) => collectImageUrls(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => collectImageUrls(v, out));
  return out;
}

/** After saving, remove managed images that were in `before` but not in `after` and are now unreferenced. */
export async function cleanupReplacedImages(before: unknown, after: unknown) {
  const prev = collectImageUrls(before);
  const next = collectImageUrls(after);
  for (const url of prev) if (!next.has(url)) await deleteManagedImageIfUnused(url);
}

/** Lean queries return BSON Binary for Buffer fields — normalise to a Node Buffer. */
export function binaryToBuffer(v: unknown): Buffer {
  if (Buffer.isBuffer(v)) return v;
  const inner = (v as { buffer?: unknown })?.buffer;
  if (inner instanceof Uint8Array) return Buffer.from(inner.buffer, inner.byteOffset, inner.byteLength);
  if (inner instanceof ArrayBuffer) return Buffer.from(inner);
  return Buffer.from(v as Uint8Array);
}
