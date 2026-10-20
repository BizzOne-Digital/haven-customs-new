"use client";

import { useState } from "react";
import { CalendarClock, Info } from "lucide-react";
import { BookingFallback, bookingUrl, useBooking } from "./BookingProvider";

type Service = { slug: string; name: string; calendarKey: string; bookingNote: string; group: string };

export default function BookingEmbed({ services, initial }: { services: Service[]; initial?: string }) {
  const { config, phone, phoneHref } = useBooking();
  const [slug, setSlug] = useState(services.some((s) => s.slug === initial) ? initial! : "");
  const svc = services.find((s) => s.slug === slug);
  const url = bookingUrl(config, svc ? { name: svc.name, calendarKey: svc.calendarKey } : undefined);
  const groups = [...new Set(services.map((s) => s.group))];

  return (
    <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
      <div className="space-y-6">
        <div>
          <label htmlFor="booking-service" className="label">Which service are you booking?</label>
          <select id="booking-service" value={slug} onChange={(e) => setSlug(e.target.value)} className="field">
            <option value="">General appointment</option>
            {groups.map((g) => (
              <optgroup key={g} label={g}>
                {services.filter((s) => s.group === g).map((s) => (
                  <option key={s.slug} value={s.slug}>{s.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        {svc?.bookingNote && (
          <p className="flex items-start gap-2 border-l-2 border-race bg-white px-4 py-3 text-sm font-medium text-ink" role="note">
            <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-race" aria-hidden /> {svc.bookingNote}
          </p>
        )}
        <div className="border border-cloud bg-pearl p-5 text-sm leading-relaxed text-graphite">
          <p className="mb-2 flex items-center gap-2 font-semibold text-ink"><Info className="h-4 w-4 text-race" aria-hidden /> Good to know</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Ceramic coating and head / tail light tint are booked <strong>Monday – Thursday only</strong>.</li>
            <li>Ceramic coating takes about 4–5 hours — plan to leave the vehicle for one full day.</li>
            <li>Tires, PPF, chrome delete, wraps and wheel lights are by appointment.</li>
            <li>Dashcam installs take about 40 minutes.</li>
          </ul>
        </div>
      </div>
      <div className="min-h-[560px] border border-cloud bg-white">
        {url ? (
          <iframe key={url} src={url} title="Book an appointment with Haven Customs" className="h-[760px] w-full border-0" loading="lazy" />
        ) : (
          <BookingFallback phone={phone} phoneHref={phoneHref} slug={svc?.slug} />
        )}
      </div>
    </div>
  );
}
