import SettingsForm from "@/components/admin/SettingsForm";
import { getBookingConfig, ghlMode } from "@/lib/integrations";
import { getSettings } from "@/lib/queries";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const s = await getSettings();
  const mode = ghlMode();
  const booking = getBookingConfig();
  const calendars = Object.keys(booking.calendars);
  const integrations = [
    {
      label: "GHL inquiries",
      ok: mode !== "none",
      detail: mode === "api" ? "Contacts API (GHL_API_KEY + GHL_LOCATION_ID)" : mode === "webhook" ? "Inbound webhook (GHL_INQUIRY_WEBHOOK_URL)" : "Not configured — inquiries are saved in admin only",
    },
    {
      label: "GHL booking calendar",
      ok: !!booking.defaultUrl,
      detail: booking.defaultUrl
        ? `Default calendar set${calendars.length ? ` · service calendars: ${calendars.join(", ")}` : ""}`
        : "Not configured — booking shows a call/contact fallback",
    },
    {
      label: "Meta Conversions API",
      ok: !!(process.env.META_PIXEL_ID && process.env.META_CONVERSION_API_TOKEN),
      detail: process.env.META_PIXEL_ID ? "Lead events sent for consenting submissions" : "Not configured",
    },
  ];
  return (
    <SettingsForm
      initial={{
        phone: s.phone, address: s.address, addressLine1: s.addressLine1, addressLine2: s.addressLine2, hours: s.hours,
        email: s.email, instagram: s.instagram, facebook: s.facebook, mapEmbedUrl: s.mapEmbedUrl, bookingIntro: s.bookingIntro,
      }}
      integrations={integrations}
    />
  );
}
