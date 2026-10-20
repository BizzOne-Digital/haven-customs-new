"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { api, ApiError, errMsg } from "./api";
import { useToast } from "./Toast";
import { Field, PageTitle } from "./ui";

type S = { phone: string; address: string; addressLine1: string; addressLine2: string; hours: string; email: string; instagram: string; facebook: string; mapEmbedUrl: string; bookingIntro: string };

export default function SettingsForm({ initial, integrations }: { initial: S; integrations: { label: string; ok: boolean; detail: string }[] }) {
  const toast = useToast();
  const [v, setV] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const f = (k: keyof S, label: string, hint?: string, long?: boolean) => (
    <Field label={label} hint={hint} error={errors[k]}>
      {long ? (
        <textarea value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} rows={2} className="field" />
      ) : (
        <input value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} className="field" />
      )}
    </Field>
  );

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      await api("/api/admin/settings", { method: "PUT", body: v });
      toast.success("Settings saved — live site updated");
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fields);
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save}>
      <PageTitle title="Settings" sub="Business details shown across the website.">
        <button disabled={saving} className="btn btn-red disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Save</button>
      </PageTitle>
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-4 border border-cloud bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {f("phone", "Phone", "Click-to-call links are generated from this")}
            {f("hours", "Hours")}
          </div>
          {f("address", "Full address")}
          <div className="grid gap-4 sm:grid-cols-2">
            {f("addressLine1", "Address line 1")}
            {f("addressLine2", "Address line 2")}
          </div>
          {f("email", "Business email", "Leave blank until confirmed — it stays hidden on the site while empty.")}
          <div className="grid gap-4 sm:grid-cols-2">
            {f("instagram", "Instagram URL")}
            {f("facebook", "Facebook URL")}
          </div>
          {f("mapEmbedUrl", "Google Maps embed URL", "Must start with https://www.google.com/maps")}
          {f("bookingIntro", "Booking page intro", "Optional. Overrides the booking page intro text.", true)}
        </div>
        <aside className="h-fit border border-cloud bg-white p-6">
          <h2 className="font-bold text-ink">Integrations</h2>
          <p className="mt-1 text-xs text-steel">Credentials live in server environment variables and are never sent to the browser.</p>
          <ul className="mt-4 space-y-3 text-sm">
            {integrations.map((i) => (
              <li key={i.label} className="flex items-start gap-3">
                <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${i.ok ? "bg-emerald-500" : "bg-amber-500"}`} aria-hidden />
                <div><p className="font-semibold text-ink">{i.label}</p><p className="text-xs text-steel">{i.detail}</p></div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </form>
  );
}
