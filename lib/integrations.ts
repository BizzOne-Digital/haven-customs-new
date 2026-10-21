import "server-only";
import crypto from "crypto";
import type { InquiryDoc } from "./models/ops";

/* ───────────────────────── GHL (HighLevel) ───────────────────────── */

export function ghlMode(): "api" | "webhook" | "none" {
  if (process.env.GHL_API_KEY && process.env.GHL_LOCATION_ID) return "api";
  if (process.env.GHL_INQUIRY_WEBHOOK_URL) return "webhook";
  return "none";
}

type GhlResult =
  | { status: "sent"; contactId?: string }
  | { status: "failed"; error: string }
  | { status: "not_configured" };

/** Forward an inquiry to GHL as a contact with tags. Never throws. */
export async function forwardInquiryToGhl(inq: InquiryDoc): Promise<GhlResult> {
  const mode = ghlMode();
  if (mode === "none") return { status: "not_configured" };

  const [firstName, ...rest] = inq.fullName.trim().split(/\s+/);
  const tags = ["website-inquiry", ...inq.products.map((p) => `product:${p.slug}`)];
  const vehicle = [inq.vehicleYear, inq.vehicleMake, inq.vehicleModel].filter(Boolean).join(" ");
  const summary = [
    `Vehicle type: ${inq.vehicleType}`,
    vehicle && `Vehicle: ${vehicle}`,
    `Services: ${inq.products.map((p) => p.name).join(", ")}`,
    inq.tiresOnRims && `Tires: ${inq.tiresOnRims}`,
    `Preferred contact: ${inq.preferredContactMethod}`,
    inq.message && `Message: ${inq.message}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    if (mode === "webhook") {
      const res = await fetch(process.env.GHL_INQUIRY_WEBHOOK_URL!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquiryId: String(inq._id),
          firstName,
          lastName: rest.join(" "),
          name: inq.fullName,
          phone: inq.phone,
          email: inq.email || undefined,
          vehicleType: inq.vehicleType,
          vehicle,
          services: inq.products.map((p) => p.name),
          tiresOnRims: inq.tiresOnRims,
          preferredContactMethod: inq.preferredContactMethod,
          message: inq.message,
          tags,
          source: "Website inquiry",
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) return { status: "failed", error: `Webhook responded ${res.status}` };
      return { status: "sent" };
    }

    const res = await fetch("https://services.leadconnectorhq.com/contacts/upsert", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GHL_API_KEY}`,
        Version: "2021-07-28",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        locationId: process.env.GHL_LOCATION_ID,
        firstName,
        lastName: rest.join(" ") || undefined,
        name: inq.fullName,
        phone: inq.phone,
        email: inq.email || undefined,
        tags,
        source: "Website inquiry",
      }),
      signal: AbortSignal.timeout(10000),
    });
    const json = (await res.json().catch(() => ({}))) as { contact?: { id?: string }; message?: string };
    if (!res.ok) return { status: "failed", error: `GHL ${res.status}: ${json.message ?? "request failed"}` };
    const contactId = json.contact?.id;

    if (contactId) {
      // Attach the inquiry details as a note. Failure here does not fail delivery.
      await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/notes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GHL_API_KEY}`,
          Version: "2021-07-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: `Website inquiry\n${summary}` }),
        signal: AbortSignal.timeout(10000),
      }).catch(() => null);
    }
    return { status: "sent", contactId };
  } catch (err) {
    return { status: "failed", error: err instanceof Error ? err.message : "Network error" };
  }
}

/* ───────────────────────── Booking calendars ───────────────────────── */

export type BookingConfig = {
  defaultUrl: string;
  calendars: Record<string, string>;
};

function isSafeWidgetUrl(v: string) {
  try {
    const u = new URL(v);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Haven Customs "Service booking" calendar (permanent GHL widget link). It is a public URL,
 * not a secret, so it is the fallback when GHL_BOOKING_WIDGET_URL is not set.
 */
const HAVEN_BOOKING_WIDGET = "https://api.leadconnectorhq.com/widget/booking/nHnHjnp24SvMsZmSECZ2";

/** Public booking widget URLs (not secrets). Mapping keys match Product.calendarKey. */
export function getBookingConfig(): BookingConfig {
  const defaultUrl = process.env.GHL_BOOKING_WIDGET_URL || HAVEN_BOOKING_WIDGET;
  let calendars: Record<string, string> = {};
  try {
    const raw = JSON.parse(process.env.GHL_CALENDAR_MAP ?? "{}");
    if (raw && typeof raw === "object") {
      calendars = Object.fromEntries(
        Object.entries(raw).filter(
          (e): e is [string, string] => typeof e[1] === "string" && isSafeWidgetUrl(e[1])
        )
      );
    }
  } catch {
    calendars = {};
  }
  return { defaultUrl: isSafeWidgetUrl(defaultUrl) ? defaultUrl : "", calendars };
}

/* ───────────────────────── Meta Conversions API ───────────────────────── */

const hash = (v: string) => crypto.createHash("sha256").update(v.trim().toLowerCase()).digest("hex");

export async function sendMetaLeadEvent(opts: {
  eventId: string;
  email?: string;
  phone?: string;
  eventSourceUrl: string;
  clientIp?: string;
  userAgent?: string;
}): Promise<"sent" | "failed" | "not_configured"> {
  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_CONVERSION_API_TOKEN;
  if (!pixelId || !token) return "not_configured";

  const user_data: Record<string, unknown> = {};
  if (opts.email) user_data.em = [hash(opts.email)];
  if (opts.phone) user_data.ph = [hash(opts.phone.replace(/\D/g, ""))];
  if (opts.clientIp && opts.clientIp !== "unknown") user_data.client_ip_address = opts.clientIp;
  if (opts.userAgent) user_data.client_user_agent = opts.userAgent;

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${pixelId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_token: token,
        data: [
          {
            event_name: "Lead",
            event_id: opts.eventId, // deduplicates with a browser pixel event using the same id
            event_time: Math.floor(Date.now() / 1000),
            action_source: "website",
            event_source_url: opts.eventSourceUrl,
            user_data,
          },
        ],
      }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok ? "sent" : "failed";
  } catch {
    return "failed";
  }
}
