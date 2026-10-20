import { Suspense } from "react";
import InquiriesManager from "@/components/admin/InquiriesManager";

export const metadata = { title: "Inquiries" };

export default function InquiriesPage() {
  return (
    <Suspense>
      <InquiriesManager />
    </Suspense>
  );
}
