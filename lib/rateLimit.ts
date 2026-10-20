import "server-only";
import { headers } from "next/headers";
import { RateLimit } from "./models/ops";

export async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim();
}

/** Fixed-window limiter stored in MongoDB so it works across serverless instances. */
export async function rateLimit(bucket: string, limit: number, windowSec: number) {
  const key = `${bucket}:${await clientIp()}`;
  const now = new Date();
  const doc = await RateLimit.findOneAndUpdate(
    { key, expiresAt: { $gt: now } },
    { $inc: { count: 1 } },
    { new: true }
  );
  if (doc) return doc.count <= limit;
  try {
    await RateLimit.findOneAndUpdate(
      { key },
      { $set: { count: 1, expiresAt: new Date(now.getTime() + windowSec * 1000) } },
      { upsert: true }
    );
  } catch {
    /* concurrent upsert — allow */
  }
  return true;
}
