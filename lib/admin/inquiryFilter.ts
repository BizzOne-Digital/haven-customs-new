import { GHL_STATUSES, INQUIRY_STATUSES } from "../constants";

export function inquiryFilter(url: URL) {
  const filter: Record<string, unknown> = {};
  const status = url.searchParams.get("status");
  if (status && (INQUIRY_STATUSES as readonly string[]).includes(status)) filter.status = status;
  const ghl = url.searchParams.get("ghl");
  if (ghl && (GHL_STATUSES as readonly string[]).includes(ghl)) filter.ghlStatus = ghl;
  const q = url.searchParams.get("q")?.trim();
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").slice(0, 80), "i");
    filter.$or = [
      { fullName: rx },
      { phone: rx },
      { email: rx },
      { "products.name": rx },
      { vehicleMake: rx },
      { vehicleModel: rx },
    ];
  }
  return filter;
}
