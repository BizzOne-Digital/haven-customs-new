import { notFound } from "next/navigation";
import ProductForm, { EMPTY_PRODUCT, type ProductInput } from "@/components/admin/ProductForm";
import { adminCategories, adminProduct } from "@/lib/admin/data";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [p, categories] = await Promise.all([adminProduct(id), adminCategories()]);
  if (!p) notFound();
  const initial: ProductInput = {
    ...EMPTY_PRODUCT,
    name: p.name,
    slug: p.slug,
    category: String(p.category ?? ""),
    shortDescription: p.shortDescription ?? "",
    longDescription: p.longDescription ?? "",
    features: p.features ?? [],
    options: p.options ?? [],
    vehicleTypes: p.vehicleTypes ?? [],
    brand: p.brand ?? "",
    warranty: p.warranty ?? "",
    bookingNote: p.bookingNote ?? "",
    calendarKey: p.calendarKey ?? "",
    faqs: (p.faqs ?? []).map((f) => ({ q: f.q, a: f.a })),
    images: (p.images ?? []).map((i) => ({ url: i.url, alt: i.alt ?? "" })),
    internalPrice: p.internalPrice ?? "",
    isFeatured: !!p.isFeatured,
    isActive: !!p.isActive,
    needsReview: !!p.needsReview,
    sortOrder: p.sortOrder ?? 0,
  };
  return <ProductForm id={id} initial={initial} categories={categories} />;
}
