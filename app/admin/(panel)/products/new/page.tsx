import ProductForm, { EMPTY_PRODUCT } from "@/components/admin/ProductForm";
import { adminCategories } from "@/lib/admin/data";

export const metadata = { title: "New product" };

export default async function NewProductPage() {
  const categories = await adminCategories();
  return <ProductForm initial={EMPTY_PRODUCT} categories={categories} />;
}
