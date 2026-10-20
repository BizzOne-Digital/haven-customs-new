"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { CONTACT_METHODS, VEHICLE_TYPES } from "@/lib/constants";
import Arrow from "./Arrow";

type Option = { slug: string; name: string; group: string; isTire: boolean };

export default function QuoteForm({ options, preselected = [] }: { options: Option[]; preselected?: string[] }) {
  const valid = preselected.filter((s) => options.some((o) => o.slug === s));
  const [selected, setSelected] = useState<string[]>(valid);
  const [pick, setPick] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);
  const formRef = useRef<HTMLFormElement>(null);

  const groups = useMemo(() => {
    const map = new Map<string, Option[]>();
    for (const o of options) map.set(o.group, [...(map.get(o.group) ?? []), o]);
    return [...map.entries()];
  }, [options]);
  const needsTire = selected.some((s) => options.find((o) => o.slug === s)?.isTire);

  function add(slug: string) {
    if (slug && !selected.includes(slug)) setSelected((s) => [...s, slug]);
    setPick("");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const fd = new FormData(e.currentTarget);
    const body = {
      fullName: String(fd.get("fullName") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      vehicleType: String(fd.get("vehicleType") ?? ""),
      vehicleMake: String(fd.get("vehicleMake") ?? ""),
      vehicleModel: String(fd.get("vehicleModel") ?? ""),
      vehicleYear: String(fd.get("vehicleYear") ?? ""),
      products: selected,
      tiresOnRims: needsTire ? String(fd.get("tiresOnRims") ?? "") : "",
      message: String(fd.get("message") ?? ""),
      preferredContactMethod: String(fd.get("preferredContactMethod") ?? "Call"),
      marketingConsent: fd.get("marketingConsent") === "on",
      company: String(fd.get("company") ?? ""),
      startedAt: startedAt.current,
      sourceUrl: window.location.href,
    };
    setStatus("sending");
    setErrors({});
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        setErrors(json.fields ?? {});
        setMessage(json.error ?? "Something went wrong. Please try again or call us.");
        setStatus("error");
        const first = json.fields && Object.keys(json.fields)[0];
        if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
        return;
      }
      setMessage(json.message);
      setStatus("done");
    } catch {
      setMessage("We couldn't send your request. Please check your connection or call us.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div role="status" className="flex flex-col items-start gap-4 border border-cloud bg-pearl p-8">
        <CheckCircle2 className="h-10 w-10 text-race" aria-hidden />
        <p className="heading text-3xl">Request received</p>
        <p className="text-graphite">{message}</p>
      </div>
    );
  }

  const err = (k: string) =>
    errors[k] ? (
      <p id={`${k}-err`} className="mt-1 text-xs font-medium text-race">
        {errors[k]}
      </p>
    ) : null;
  const aria = (k: string) => ({ "aria-invalid": errors[k] ? true : undefined, "aria-describedby": errors[k] ? `${k}-err` : undefined });

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-5">
      {/* Honeypot */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>Company<input name="company" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className="label">Full name *</label>
          <input id="fullName" name="fullName" required autoComplete="name" className="field" {...aria("fullName")} />
          {err("fullName")}
        </div>
        <div>
          <label htmlFor="phone" className="label">Phone *</label>
          <input id="phone" name="phone" type="tel" required autoComplete="tel" className="field" {...aria("phone")} />
          {err("phone")}
        </div>
      </div>
      <div>
        <label htmlFor="email" className="label">Email <span className="font-normal text-steel">(optional)</span></label>
        <input id="email" name="email" type="email" autoComplete="email" className="field" {...aria("email")} />
        {err("email")}
      </div>

      <fieldset className="grid gap-5 sm:grid-cols-4">
        <legend className="sr-only">Vehicle</legend>
        <div className="sm:col-span-4">
          <label htmlFor="vehicleType" className="label">Vehicle type *</label>
          <select id="vehicleType" name="vehicleType" required defaultValue="" className="field" {...aria("vehicleType")}>
            <option value="" disabled>Select your vehicle type</option>
            {VEHICLE_TYPES.map((v) => <option key={v}>{v}</option>)}
            <option>Other</option>
          </select>
          {err("vehicleType")}
        </div>
        <div>
          <label htmlFor="vehicleYear" className="label">Year</label>
          <input id="vehicleYear" name="vehicleYear" inputMode="numeric" maxLength={4} className="field" {...aria("vehicleYear")} />
          {err("vehicleYear")}
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="vehicleMake" className="label">Make</label>
          <input id="vehicleMake" name="vehicleMake" className="field" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="vehicleModel" className="label">Model</label>
          <input id="vehicleModel" name="vehicleModel" className="field" />
        </div>
      </fieldset>

      <div>
        <label htmlFor="productPicker" className="label">Services *</label>
        {selected.length > 0 && (
          <ul className="mb-2 flex flex-wrap gap-2" aria-label="Selected services">
            {selected.map((s) => (
              <li key={s} className="inline-flex items-center gap-1 bg-ink py-1.5 pl-3 pr-1.5 text-xs font-medium text-white">
                {options.find((o) => o.slug === s)?.name ?? s}
                <button type="button" onClick={() => setSelected((x) => x.filter((y) => y !== s))} aria-label={`Remove ${options.find((o) => o.slug === s)?.name}`} className="grid h-6 w-6 place-items-center hover:text-race">
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
        <select
          id="productPicker"
          name="products"
          value={pick}
          onChange={(e) => add(e.target.value)}
          className="field"
          {...aria("products")}
        >
          <option value="">{selected.length ? "Add another service…" : "Choose a service…"}</option>
          {groups.map(([g, items]) => (
            <optgroup key={g} label={g}>
              {items.map((o) => (
                <option key={o.slug} value={o.slug} disabled={selected.includes(o.slug)}>{o.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
        {err("products")}
      </div>

      {needsTire && (
        <fieldset>
          <legend className="label">Are your tires on rims or off rims?</legend>
          <div className="flex flex-wrap gap-4">
            {["On rims", "Off rims", "Not sure"].map((v) => (
              <label key={v} className="inline-flex min-h-[44px] items-center gap-2 text-sm text-ink">
                <input type="radio" name="tiresOnRims" value={v} className="h-4 w-4 accent-[#ed1018]" /> {v}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div>
        <label htmlFor="message" className="label">Message</label>
        <textarea id="message" name="message" rows={4} maxLength={3000} className="field" placeholder="Tell us what you're looking for — shade, coverage, model, timing…" />
      </div>

      <fieldset>
        <legend className="label">Preferred contact method</legend>
        <div className="flex flex-wrap gap-4">
          {CONTACT_METHODS.map((m, i) => (
            <label key={m} className="inline-flex min-h-[44px] items-center gap-2 text-sm text-ink">
              <input type="radio" name="preferredContactMethod" value={m} defaultChecked={i === 0} className="h-4 w-4 accent-[#ed1018]" /> {m}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex items-start gap-3 text-xs leading-relaxed text-steel">
        <input type="checkbox" name="marketingConsent" className="mt-0.5 h-4 w-4 accent-[#ed1018]" />
        I agree that Haven Customs may use my submission to measure advertising performance (Meta). Optional.
      </label>

      {status === "error" && message && (
        <p role="alert" className="border-l-2 border-race bg-race/5 px-4 py-3 text-sm text-ink">{message}</p>
      )}

      <div>
        <button type="submit" disabled={status === "sending"} className="btn btn-red px-8 disabled:opacity-60">
          {status === "sending" ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Sending…</> : <>Send Request <Arrow /></>}
        </button>
      </div>
    </form>
  );
}
