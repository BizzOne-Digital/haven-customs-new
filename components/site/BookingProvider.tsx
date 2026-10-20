"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CalendarClock, Phone, X } from "lucide-react";

export type BookingConfig = { defaultUrl: string; calendars: Record<string, string> };
export type BookingContext = { slug?: string; name?: string; calendarKey?: string; note?: string };

type Ctx = { open: (ctx?: BookingContext) => void; config: BookingConfig; phone: string; phoneHref: string };
const BookingCtx = createContext<Ctx | null>(null);

export function useBooking() {
  const ctx = useContext(BookingCtx);
  if (!ctx) throw new Error("useBooking must be used inside BookingProvider");
  return ctx;
}

/** Resolve the GHL widget URL for a service and attach the service context as a query param. */
export function bookingUrl(config: BookingConfig, ctx?: BookingContext) {
  const base = (ctx?.calendarKey && config.calendars[ctx.calendarKey]) || config.defaultUrl;
  if (!base) return "";
  const u = new URL(base);
  if (ctx?.name) u.searchParams.set("service", ctx.name);
  return u.toString();
}

export default function BookingProvider({
  config,
  phone,
  phoneHref,
  children,
}: {
  config: BookingConfig;
  phone: string;
  phoneHref: string;
  children: React.ReactNode;
}) {
  const [state, setState] = useState<{ open: boolean; ctx?: BookingContext }>({ open: false });
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const open = useCallback((ctx?: BookingContext) => {
    lastFocus.current = document.activeElement as HTMLElement;
    setState({ open: true, ctx });
  }, []);
  const close = useCallback(() => setState((s) => ({ ...s, open: false })), []);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (state.open && !d.open) d.showModal(); // native dialog traps focus and handles Esc
    if (!state.open && d.open) {
      d.close();
      lastFocus.current?.focus();
    }
  }, [state.open]);

  const url = bookingUrl(config, state.ctx);

  return (
    <BookingCtx.Provider value={{ open, config, phone, phoneHref }}>
      {children}
      <dialog
        ref={dialogRef}
        onClose={close}
        onClick={(e) => e.target === dialogRef.current && close()}
        aria-labelledby="booking-title"
        className="m-auto w-[min(100vw-1.5rem,880px)] max-h-[92vh] overflow-hidden rounded-[3px] bg-white p-0 shadow-2xl backdrop:bg-ink/60"
      >
        {state.open && (
          <div className="flex max-h-[92vh] flex-col">
            <div className="flex items-start justify-between gap-4 border-b border-mist px-5 py-4 sm:px-7">
              <div>
                <p className="eyebrow">Book appointment</p>
                <h2 id="booking-title" className="heading mt-1 text-2xl sm:text-3xl">
                  {state.ctx?.name ?? "Choose a time"}
                </h2>
                {state.ctx?.note && <p className="mt-1 text-sm text-race">{state.ctx.note}</p>}
              </div>
              <button onClick={close} className="grid h-11 w-11 place-items-center rounded-full hover:bg-pearl" aria-label="Close booking">
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {url ? (
                <iframe src={url} title="Book an appointment with Haven Customs" className="h-[70vh] w-full border-0" loading="lazy" />
              ) : (
                <BookingFallback phone={phone} phoneHref={phoneHref} slug={state.ctx?.slug} onNavigate={close} />
              )}
            </div>
          </div>
        )}
      </dialog>
    </BookingCtx.Provider>
  );
}

export function BookingFallback({
  phone,
  phoneHref,
  slug,
  onNavigate,
}: {
  phone: string;
  phoneHref: string;
  slug?: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-5 px-6 py-12 text-center">
      <CalendarClock className="h-10 w-10 text-race" aria-hidden />
      <div>
        <p className="heading text-2xl">Online booking is being set up</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-steel">
          Call the shop or send us your details and our team will confirm a time with you.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <a href={phoneHref} className="btn btn-red">
          <Phone className="h-4 w-4" aria-hidden /> Call {phone}
        </a>
        <Link href={slug ? `/contact?service=${slug}` : "/contact"} onClick={onNavigate} className="btn btn-outline">
          Send a request
        </Link>
      </div>
    </div>
  );
}
