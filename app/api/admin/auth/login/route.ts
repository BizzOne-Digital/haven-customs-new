import { connectDB } from "@/lib/db";
import { createSession, isSameOrigin, verifyPassword } from "@/lib/auth";
import { AdminUser } from "@/lib/models/ops";
import { fail, handleError, ok, parse } from "@/lib/api";
import { rateLimit } from "@/lib/rateLimit";
import { loginSchema } from "@/lib/validation";

export const runtime = "nodejs";

const DUMMY_HASH = `scrypt$${"0".repeat(32)}$${"0".repeat(128)}`;

export async function POST(req: Request) {
  if (!(await isSameOrigin(req))) return fail("Invalid request origin", 403);
  try {
    await connectDB();
    if (!(await rateLimit("login", 8, 15 * 60))) return fail("Too many attempts. Try again in 15 minutes.", 429);
    const { email, password } = await parse(req, loginSchema);
    const user = await AdminUser.findOne({ email }).select("+passwordHash");
    // Always run a hash comparison so response timing doesn't reveal which emails exist.
    const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !valid) return fail("Incorrect email or password", 401);
    user.lastLoginAt = new Date();
    await user.save();
    await createSession(String(user._id), req.headers.get("user-agent")?.slice(0, 200) ?? "");
    return ok({ user: { email: user.email, name: user.name } });
  } catch (err) {
    return handleError(err);
  }
}
