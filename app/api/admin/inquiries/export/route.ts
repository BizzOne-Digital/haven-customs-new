import { isResponse, requireAdminApi } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { handleError } from "@/lib/api";
import { inquiryFilter } from "@/lib/admin/inquiryFilter";
import { Inquiry } from "@/lib/models/ops";

export const runtime = "nodejs";

/** Quote a CSV cell and neutralise spreadsheet formula injection. */
function cell(v: unknown) {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(req: Request) {
  const admin = await requireAdminApi(req);
  if (isResponse(admin)) return admin;
  try {
    await connectDB();
    const items = await Inquiry.find(inquiryFilter(new URL(req.url))).sort({ createdAt: -1 }).limit(10000).lean();
    const header = [
      "Created", "Name", "Phone", "Email", "Vehicle type", "Year", "Make", "Model",
      "Services", "Tires", "Contact method", "Message", "Status", "GHL status",
    ];
    const rows = items.map((i) => [
      new Date(i.createdAt as unknown as string).toISOString(), i.fullName, i.phone, i.email, i.vehicleType,
      i.vehicleYear, i.vehicleMake, i.vehicleModel, (i.products ?? []).map((p) => p.name).join("; "),
      i.tiresOnRims, i.preferredContactMethod, i.message, i.status, i.ghlStatus,
    ]);
    const csv = [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
    return new Response("﻿" + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="haven-inquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return handleError(err);
  }
}
