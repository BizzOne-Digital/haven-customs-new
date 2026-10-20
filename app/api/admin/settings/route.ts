import { isResponse, requireAdminApi } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { handleError, ok, parse } from "@/lib/api";
import { SiteSettings } from "@/lib/models/ops";
import { getSettings } from "@/lib/queries";
import { settingsSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const admin = await requireAdminApi(req);
  if (isResponse(admin)) return admin;
  return ok({ settings: await getSettings() });
}

export async function PUT(req: Request) {
  const admin = await requireAdminApi(req);
  if (isResponse(admin)) return admin;
  try {
    await connectDB();
    const data = await parse(req, settingsSchema);
    await SiteSettings.findOneAndUpdate({ key: "site" }, { $set: data }, { upsert: true });
    return ok({ settings: await getSettings() });
  } catch (err) {
    return handleError(err);
  }
}
