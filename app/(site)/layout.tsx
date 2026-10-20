import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import BookingProvider from "@/components/site/BookingProvider";
import RevealOnScroll, { MOTION_BOOT } from "@/components/site/RevealOnScroll";
import { getBookingConfig } from "@/lib/integrations";
import { getSettings } from "@/lib/queries";

// Settings (phone, hours, socials) are admin-editable, so every public page renders per request.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <BookingProvider config={getBookingConfig()} phone={settings.phone} phoneHref={settings.phoneHref}>
      {/* Runs before the page paints so revealed elements never flash. */}
      <script dangerouslySetInnerHTML={{ __html: MOTION_BOOT }} />
      <Header phone={settings.phone} phoneHref={settings.phoneHref} />
      <main id="main">{children}</main>
      <Footer s={settings} />
      <RevealOnScroll />
    </BookingProvider>
  );
}
