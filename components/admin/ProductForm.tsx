"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Loader2, Plus, Star, Trash2 } from "lucide-react";
import { VEHICLE_TYPES } from "@/lib/constants";
import AdminImageField from "./AdminImageField";
import { api, ApiError, errMsg } from "./api";
import { useToast } from "./Toast";
import { Field, ListEditor, PageTitle, Toggle } from "./ui";

export type ProductInput = {
  name: string; slug: string; category: string; shortDescription: string; longDescription: string;
  features: string[]; options: string[]; vehicleTypes: string[]; brand: string; warranty: string; bookingNote: string;
  calendarKey: string; faqs: { q: string; a: string }[]; images: { url: string; alt: string }[]; internalPrice: string;
  isFeatured: boolean; isActive: boolean; needsReview: boolean; sortOrder: number;
};

export const EMPTY_PRODUCT: ProductInput = {
  name: "", slug: "", category: "", shortDescription: "", longDescription: "", features: [], options: [], vehicleTypes: [...VEHICLE_TYPES],
  brand: "", warranty: "", bookingNote: "", calendarKey: "", faqs: [], images: [], internalPrice: "",
  isFeatured: false, isActive: true, needsReview: false, sortOrder: 0,
};

export default function ProductForm({ id, initial, categories }: { id?: string; initial: ProductInput; categories: { id: string; name: string }[] }) {
  const router = useRouter();
  const toast = useToast();
  const [v, setV] = useState<ProductInput>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof ProductInput>(k: K, val: ProductInput[K]) => setV((s) => ({ ...s, [k]: val }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    const body = {
      ...v,
      slug: v.slug || undefined,
      features: v.features.map((s) => s.trim()).filter(Boolean),
      options: v.options.map((s) => s.trim()).filter(Boolean),
      faqs: v.faqs.filter((f) => f.q.trim() && f.a.trim()),
      images: v.images.filter((i) => i.url),
    };
    try {
      const res = await api<{ item: { _id: string } }>(id ? `/api/admin/products/${id}` : "/api/admin/products", { method: id ? "PUT" : "POST", body });
      toast.success(id ? "Product saved — live site updated" : "Product created");
      if (!id) router.replace(`/admin/products/${res.item._id}/edit`);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fields);
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save}>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1 text-sm text-steel hover:text-ink"><ArrowLeft className="h-4 w-4" aria-hidden /> Products</Link>
      <PageTitle title={id ? "Edit product" : "New product"}>
        {id && v.slug && <Link href={`/services/${v.slug}`} target="_blank" className="btn btn-outline">View live</Link>}
        <button disabled={saving} className="btn btn-red disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Save</button>
      </PageTitle>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card title="Basics">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name *" error={errors.name}><input value={v.name} onChange={(e) => set("name", e.target.value)} className="field" required /></Field>
              <Field label="Slug" error={errors.slug} hint="Leave blank to generate from the name"><input value={v.slug} onChange={(e) => set("slug", e.target.value)} className="field" /></Field>
              <Field label="Category *" error={errors.category}>
                <select value={v.category} onChange={(e) => set("category", e.target.value)} className="field" required>
                  <option value="">Select…</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Brand" error={errors.brand}><input value={v.brand} onChange={(e) => set("brand", e.target.value)} className="field" /></Field>
            </div>
            <Field label="Short description" error={errors.shortDescription} hint="Shown on cards. Max 200 characters. No prices.">
              <textarea value={v.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} maxLength={200} rows={2} className="field" />
            </Field>
            <Field label="Detailed description" error={errors.longDescription}>
              <textarea value={v.longDescription} onChange={(e) => set("longDescription", e.target.value)} rows={6} className="field" />
            </Field>
          </Card>

          <Card title="Features & options">
            <ListEditor label="Features" placeholder="feature" value={v.features} onChange={(x) => set("features", x)} />
            {errors.features && <p className="text-xs text-race">{errors.features}</p>}
            <ListEditor label="Options" placeholder="option" value={v.options} onChange={(x) => set("options", x)} />
            {errors.options && <p className="text-xs text-race">{errors.options}</p>}
          </Card>

          <Card title="Images">
            <ul className="space-y-5">
              {v.images.map((img, i) => (
                <li key={i} className="grid gap-3 border-b border-cloud pb-5 md:grid-cols-[1fr_1fr_auto] md:items-end">
                  <AdminImageField folder="products" label={i === 0 ? "Cover image" : `Image ${i + 1}`} value={img.url} onChange={(url) => set("images", v.images.map((x, j) => (j === i ? { ...x, url } : x)))} />
                  <Field label="Alt text"><input value={img.alt} onChange={(e) => set("images", v.images.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))} className="field" /></Field>
                  <div className="flex gap-1">
                    {i > 0 && (
                      <button type="button" onClick={() => set("images", [img, ...v.images.filter((_, j) => j !== i)])} className="btn btn-outline min-h-[40px] px-3 text-xs" title="Make cover">
                        <Star className="h-3.5 w-3.5" aria-hidden /> Cover
                      </button>
                    )}
                    <button type="button" onClick={() => set("images", v.images.filter((_, j) => j !== i))} aria-label={`Remove image ${i + 1}`} className="btn btn-outline min-h-[40px] px-3 text-race"><Trash2 className="h-4 w-4" aria-hidden /></button>
                  </div>
                </li>
              ))}
            </ul>
            {errors.images && <p className="text-xs text-race">{errors.images}</p>}
            {v.images.length < 12 && (
              <button type="button" onClick={() => set("images", [...v.images, { url: "", alt: v.name }])} className="inline-flex items-center gap-1 text-sm font-semibold text-race">
                <Plus className="h-4 w-4" aria-hidden /> Add image
              </button>
            )}
          </Card>

          <Card title="FAQ">
            {v.faqs.map((f, i) => (
              <div key={i} className="grid gap-2 border-b border-cloud pb-4">
                <input value={f.q} placeholder="Question" onChange={(e) => set("faqs", v.faqs.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))} className="field" aria-label={`FAQ ${i + 1} question`} />
                <textarea value={f.a} placeholder="Answer" rows={2} onChange={(e) => set("faqs", v.faqs.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))} className="field" aria-label={`FAQ ${i + 1} answer`} />
                <button type="button" onClick={() => set("faqs", v.faqs.filter((_, j) => j !== i))} className="justify-self-start text-xs font-semibold text-race">Remove</button>
              </div>
            ))}
            {errors.faqs && <p className="text-xs text-race">{errors.faqs}</p>}
            <button type="button" onClick={() => set("faqs", [...v.faqs, { q: "", a: "" }])} className="inline-flex items-center gap-1 text-sm font-semibold text-race"><Plus className="h-4 w-4" aria-hidden /> Add question</button>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Visibility">
            <Toggle label="Active (visible on site)" checked={v.isActive} onChange={(x) => set("isActive", x)} />
            <Toggle label="Featured" checked={v.isFeatured} onChange={(x) => set("isFeatured", x)} />
            <Toggle label="Needs review" checked={v.needsReview} onChange={(x) => set("needsReview", x)} />
            <Field label="Sort order" hint="Lower numbers show first"><input type="number" min={0} value={v.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value) || 0)} className="field" /></Field>
          </Card>

          <Card title="Vehicle types">
            {VEHICLE_TYPES.map((t) => (
              <label key={t} className="flex min-h-[36px] items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={v.vehicleTypes.includes(t)} onChange={(e) => set("vehicleTypes", e.target.checked ? [...v.vehicleTypes, t] : v.vehicleTypes.filter((x) => x !== t))} className="h-4 w-4 accent-[#ed1018]" />
                {t}
              </label>
            ))}
          </Card>

          <Card title="Warranty & booking">
            <Field label="Warranty" error={errors.warranty}><input value={v.warranty} onChange={(e) => set("warranty", e.target.value)} className="field" placeholder="e.g. 7 years — peeling and bubbling" /></Field>
            <Field label="Booking note" error={errors.bookingNote} hint="Shown publicly, e.g. “Monday – Thursday only”"><textarea value={v.bookingNote} onChange={(e) => set("bookingNote", e.target.value)} rows={2} className="field" /></Field>
            <Field label="Calendar key" error={errors.calendarKey} hint="Matches a key in GHL_CALENDAR_MAP, e.g. mon-thu. Blank = default calendar."><input value={v.calendarKey} onChange={(e) => set("calendarKey", e.target.value)} className="field" /></Field>
          </Card>

          <Card title="Internal (admin only)">
            <Field label="Internal price notes" hint="Never shown on the public website."><textarea value={v.internalPrice} onChange={(e) => set("internalPrice", e.target.value)} rows={3} className="field" /></Field>
          </Card>
        </div>
      </div>
    </form>
  );
}

export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-cloud bg-white">
      <h2 className="border-b border-cloud px-5 py-3 font-bold text-ink">{title}</h2>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}
