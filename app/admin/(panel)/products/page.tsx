import { Suspense } from "react";
import ProductsTable from "@/components/admin/ProductsTable";
import { adminCategories } from "@/lib/admin/data";

export const metadata = { title: "Products" };

export default async function ProductsPage() {
  const categories = await adminCategories();
  return (
    <Suspense>
      <ProductsTable categories={categories} />
    </Suspense>
  );
}
