import "server-only";
import crypto from "crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { connectDB } from "./db";
import { AdminSession, AdminUser } from "./models/ops";

export { hashPassword, verifyPassword } from "./password";

export const SESSION_COOKIE = "hc_admin";
const SESSION_DAYS = 7;

const sha256 = (v: string) => crypto.createHash("sha256").update(v).digest("hex");

export async function createSession(userId: string, userAgent: string) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000);
  await AdminSession.create({ tokenHash: sha256(token), user: userId, expiresAt, userAgent });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await connectDB();
    await AdminSession.deleteOne({ tokenHash: sha256(token) });
  }
  jar.delete(SESSION_COOKIE);
}

export type AdminIdentity = { id: string; email: string; name: string };

export async function getAdmin(): Promise<AdminIdentity | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  await connectDB();
  const session = await AdminSession.findOne({ tokenHash: sha256(token), expiresAt: { $gt: new Date() } }).lean();
  if (!session) return null;
  const user = await AdminUser.findById(session.user).lean();
  if (!user) return null;
  return { id: String(user._id), email: user.email, name: user.name ?? "Admin" };
}

/** For admin server components / layouts. */
export async function requireAdminPage() {
  const admin = await getAdmin().catch(() => null);
  if (!admin) redirect("/admin/login");
  return admin;
}

/** Same-origin check for state-changing requests (CSRF defence alongside SameSite cookies). */
export async function isSameOrigin(req: Request) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return true;
  const origin = req.headers.get("origin");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** For admin route handlers. Returns the admin or an error Response. */
export async function requireAdminApi(req: Request): Promise<AdminIdentity | NextResponse> {
  if (!(await isSameOrigin(req))) {
    return NextResponse.json({ success: false, error: "Invalid request origin" }, { status: 403 });
  }
  const admin = await getAdmin().catch(() => null);
  if (!admin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  return admin;
}

export function isResponse(v: unknown): v is NextResponse {
  return v instanceof Response;
}
