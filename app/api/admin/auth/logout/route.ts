import { destroySession, isSameOrigin } from "@/lib/auth";
import { fail, ok } from "@/lib/api";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!(await isSameOrigin(req))) return fail("Invalid request origin", 403);
  await destroySession();
  return ok({});
}
