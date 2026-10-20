"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import Logo from "./Logo";
import BookButton from "./BookButton";

const NAV = [
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];
const MORE = [
  { href: "/offers", label: "Offers" },
  { href: "/brands", label: "Brands" },
  { href: "/booking", label: "Booking" },
];

export default function Header({ phone, phoneHref }: { phone: string; phoneHref: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close the drawer on navigation (state adjustment during render, not in an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    drawerRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className={`sticky top-0 z-40 bg-white/95 backdrop-blur transition-shadow ${scrolled ? "shadow-[0_1px_0_#e4e5e7]" : ""}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <div className="mx-auto flex h-[84px] max-w-[1320px] items-center justify-between gap-6 px-4 sm:px-6 lg:h-[100px] lg:px-10">
        <Logo className="h-16 lg:h-[84px]" priority />
        <nav aria-label="Main" className="hidden items-center gap-10 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={isActive(n.href) ? "page" : undefined}
              className={`text-[0.82rem] font-semibold transition-colors hover:text-race ${isActive(n.href) ? "text-race" : "text-ink"}`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <BookButton />
          </div>
          <button
            ref={toggleRef}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid h-11 w-11 place-items-center text-ink lg:hidden"
          >
            {open ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        id="mobile-menu"
        ref={drawerRef}
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-[84px] z-40 overflow-y-auto bg-white lg:hidden"
      >
        <nav aria-label="Mobile" className="flex flex-col px-5 pb-10 pt-4">
          {[...NAV, ...MORE].map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={isActive(n.href) ? "page" : undefined}
              className={`display border-b border-cloud py-4 text-4xl ${isActive(n.href) ? "text-race" : "text-ink"}`}
            >
              {n.label}
            </Link>
          ))}
          <div className="mt-8 flex flex-col gap-3">
            <BookButton className="btn btn-red w-full" />
            <a href={phoneHref} className="btn btn-outline w-full">
              <Phone className="h-4 w-4" aria-hidden /> {phone}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
