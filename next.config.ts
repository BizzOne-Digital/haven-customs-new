import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongoose"],
  images: {
    localPatterns: [{ pathname: "/api/uploads/**" }, { pathname: "/images/**" }, { pathname: "/logo.png" }],
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com", pathname: "/**" }],
    qualities: [75, 85],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
  /**
   * 301s from the previous Shopify site (havencustoms.com) so old links and rankings carry over
   * when the domain moves here. Specific paths first; catch-alls last.
   */
  async redirects() {
    const r = (source: string, destination: string) => ({ source, destination, permanent: true });
    return [
      r("/pages/book-appointment", "/booking"),
      r("/pages/book-an-appointment", "/booking"),
      r("/pages/contact-us", "/contact"),
      r("/pages/contact", "/contact"),
      r("/pages/email-us", "/contact"),
      r("/pages/about-us", "/about"),
      r("/pages/about", "/about"),
      r("/pages/our-services", "/services"),
      r("/pages/ceramic-coating", "/services?category=paint-protection"),
      r("/pages/ppf", "/services/full-body-ppf"),
      r("/pages/paint-protection-film", "/services/full-body-ppf"),
      r("/pages/window-tint", "/services?category=window-tint"),
      r("/pages/window-tinting", "/services?category=window-tint"),
      r("/pages/tire-services", "/tire-installation"),
      r("/pages/tires", "/tire-installation"),
      r("/pages/premium-lighting-upgrades", "/services?category=lighting"),
      r("/pages/custom-automotive-upgrades", "/services?category=exterior"),
      r("/pages/dash-cams", "/services?category=dashcams"),
      r("/collections/dashcam-collection", "/services?category=dashcams"),
      r("/collections/drivesafe-collection", "/services?category=dashcams"),
      // Tire and rim collections/products: no online store here, so send them to tire installation.
      r("/collections/:handle*", "/tire-installation"),
      r("/products/:handle*", "/services"),
      r("/pages/:handle*", "/services"),
      r("/blogs/:handle*", "/"),
      r("/cart", "/services"),
      r("/account/:path*", "/"),
    ];
  },
};

export default nextConfig;
