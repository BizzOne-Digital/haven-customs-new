import Link from "next/link";
import { Clock, Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import Logo from "./Logo";
import type { PublicSettings } from "@/lib/queries";

const LINKS = [
  { href: "/services", label: "All Services" },
  { href: "/offers", label: "Offers" },
  { href: "/booking", label: "Book Appointment" },
  { href: "/gallery", label: "Gallery" },
  { href: "/brands", label: "Brands" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Footer({ s }: { s: PublicSettings }) {
  return (
    <footer className="border-t border-cloud bg-white">
      <div className="mx-auto grid max-w-[1320px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-[auto_1fr] lg:px-10">
        <Logo className="h-20" />
        <div className="grid gap-6 text-sm text-graphite sm:grid-cols-2 lg:grid-cols-4 lg:items-center">
          <p className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink" aria-hidden />
            <span>
              {s.addressLine1}
              <br />
              {s.addressLine2}
            </span>
          </p>
          <a href={s.phoneHref} className="flex items-center gap-3 hover:text-race">
            <Phone className="h-4 w-4 shrink-0 text-ink" aria-hidden /> {s.phone}
          </a>
          <p className="flex items-center gap-3">
            <Clock className="h-4 w-4 shrink-0 text-ink" aria-hidden /> {s.hours}
          </p>
          <div className="flex items-center gap-4">
            {s.email && (
              <a href={`mailto:${s.email}`} aria-label={`Email ${s.email}`} className="text-ink hover:text-race">
                <Mail className="h-5 w-5" aria-hidden />
              </a>
            )}
            {s.instagram && (
              <a href={s.instagram} target="_blank" rel="noopener noreferrer" aria-label="Haven Customs on Instagram" className="text-ink hover:text-race">
                <Instagram className="h-5 w-5" aria-hidden />
              </a>
            )}
            {s.facebook && (
              <a href={s.facebook} target="_blank" rel="noopener noreferrer" aria-label="Haven Customs on Facebook" className="text-ink hover:text-race">
                <Facebook className="h-5 w-5" aria-hidden />
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-cloud">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-steel">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-race">
                {l.label}
              </Link>
            ))}
          </nav>
          <p className="text-xs text-steel">© {new Date().getFullYear()} Haven Customs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
