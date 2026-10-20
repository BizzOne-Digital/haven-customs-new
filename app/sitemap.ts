import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/queries";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const pages = ["", "/services", "/offers", "/booking", "/contact", "/brands", "/gallery", "/about"].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
  const products = await getProducts().catch(() => []);
  return [...pages, ...products.map((p) => ({ url: `${base}/services/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.6 }))];
}
