import "server-only";
import { UploadChunk, UploadSession } from "./models/ops";

const SESSION_RE = /^[a-f0-9]{32}$/;

/** Load an unexpired upload session owned by this admin, or null. */
export async function ownedSession(sessionId: string, adminId: string) {
  if (!SESSION_RE.test(sessionId)) return null;
  return UploadSession.findOne({ sessionId, owner: adminId, expiresAt: { $gt: new Date() } }).lean();
}

export async function discardSession(sessionId: string) {
  await Promise.all([UploadChunk.deleteMany({ sessionId }), UploadSession.deleteOne({ sessionId })]);
}
