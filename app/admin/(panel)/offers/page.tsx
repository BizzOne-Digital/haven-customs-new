import { OffersManager } from "@/components/admin/Managers";
import { adminProductOptions } from "@/lib/admin/data";

export const metadata = { title: "Offers" };

export default async function OffersPage() {
  return <OffersManager products={await adminProductOptions()} />;
}
