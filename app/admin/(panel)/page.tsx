import Link from "next/link";
import { AlertTriangle, Inbox, Package, PackageX, Plus } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Product } from "@/lib/models/catalog";
import { Inquiry } from "@/lib/models/ops";
import { ghlMode, getBookingConfig } from "@/lib/integrations";

export const metadata = { title: "Dashboard" };

const daysAgo = (n: number) => new Date(Date.now() - n * 86400_000);

export default async function Dashboard() {
  await connectDB();
  const weekAgo = daysAgo(7);
  const [total, active, review, newInq, failed, recent, updated] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ needsReview: true }),
    Inquiry.countDocuments({ createdAt: { $gte: weekAgo } }),
    Inquiry.countDocuments({ ghlStatus: "failed" }),
    Inquiry.find({}, "fullName products status ghlStatus createdAt").sort({ createdAt: -1 }).limit(6).lean(),
    Product.find({}, "name updatedAt isActive").sort({ updatedAt: -1 }).limit(5).lean(),
  ]);
  const ghl = ghlMode();
  const booking = getBookingConfig();

  const stats = [
    { label: "Total products", value: total, icon: Package, href: "/admin/products" },
    { label: "Active", value: active, icon: Package, href: "/admin/products?isActive=true" },
    { label: "Hidden", value: total - active, icon: PackageX, href: "/admin/products?isActive=false" },
    { label: "New inquiries (7 days)", value: newInq, icon: Inbox, href: "/admin/inquiries" },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="heading text-4xl">Dashboard</h1>
        <Link href="/admin/products/new" className="btn btn-red"><Plus className="h-4 w-4" aria-hidden /> Add product</Link>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <li key={label}>
            <Link href={href} className="flex items-center justify-between border border-cloud bg-white p-5 hover:border-silver">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-steel">{label}</p>
                <p className="font-num mt-1 text-4xl font-medium text-ink">{value}</p>
              </div>
              <Icon className="h-6 w-6 text-race" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>

      {(review > 0 || failed > 0 || ghl === "none" || !booking.defaultUrl) && (
        <div className="mt-6 space-y-2">
          {review > 0 && <Alert href="/admin/products?needsReview=true">{review} product(s) are marked “needs review” and hidden until approved.</Alert>}
          {failed > 0 && <Alert href="/admin/inquiries?ghl=failed">{failed} inquiry(ies) failed to reach GHL. Open them to retry.</Alert>}
          {ghl === "none" && <Alert>GHL is not configured — inquiries are saved here but not forwarded. Add GHL credentials in the environment.</Alert>}
          {!booking.defaultUrl && <Alert>No GHL booking calendar is configured. The booking page shows a call/contact fallback.</Alert>}
        </div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="border border-cloud bg-white">
          <div className="flex items-center justify-between border-b border-cloud px-5 py-3">
            <h2 className="font-bold text-ink">Recent inquiries</h2>
            <Link href="/admin/inquiries" className="text-xs font-semibold text-race">View all</Link>
          </div>
          {recent.length === 0 ? (
            <p className="px-5 py-8 text-sm text-steel">No inquiries yet.</p>
          ) : (
            <ul className="divide-y divide-cloud">
              {recent.map((i) => (
                <li key={String(i._id)}>
                  <Link href={`/admin/inquiries?open=${i._id}`} className="flex items-center justify-between gap-4 px-5 py-3 text-sm hover:bg-pearl">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">{i.fullName}</p>
                      <p className="truncate text-xs text-steel">{i.products.map((p) => p.name).join(", ")}</p>
                    </div>
                    <div className="shrink-0 text-right text-xs text-steel">
                      <p>{i.status}</p>
                      <p>{new Date(i.createdAt!).toLocaleDateString("en-CA")}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="border border-cloud bg-white">
          <div className="border-b border-cloud px-5 py-3"><h2 className="font-bold text-ink">Recently edited products</h2></div>
          <ul className="divide-y divide-cloud">
            {updated.map((p) => (
              <li key={String(p._id)}>
                <Link href={`/admin/products/${p._id}/edit`} className="flex items-center justify-between px-5 py-3 text-sm hover:bg-pearl">
                  <span className="font-medium text-ink">{p.name}</span>
                  <span className="text-xs text-steel">{p.isActive ? "Active" : "Hidden"} · {new Date(p.updatedAt!).toLocaleDateString("en-CA")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Alert({ children, href }: { children: React.ReactNode; href?: string }) {
  const body = (
    <span className="flex items-start gap-3 border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-sm text-ink">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden /> {children}
    </span>
  );
  return href ? <Link href={href} className="block hover:opacity-90">{body}</Link> : body;
}
