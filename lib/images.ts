/** Generated local artwork. Only known original stock paths are remapped; custom uploads stay unchanged. */
export const IMG = {
  "heroCar": "/images/haven/hero-car.png",
  "tint": "/images/haven/window-tint.webp",
  "ppf": "/images/haven/paint-protection.webp",
  "ceramic": "/images/haven/ceramic-coating.webp",
  "dashcam": "/images/haven/dashcam.webp",
  "interior": "/images/haven/carplay-interior.webp",
  "light": "/images/haven/headlight.webp",
  "tire": "/images/haven/tire-service.webp",
  "decal": "/images/haven/vinyl-wrap.webp",
  "wheel": "/images/haven/alloy-wheel.webp",
  "precisionCar": "/images/haven/precision-car.webp",
  "tailLight": "/images/haven/tail-light.webp",
  "blackCar": "/images/haven/chrome-delete.webp",
  "graphite": "/images/haven/logo-blackout.webp"
} as const;

const LEGACY_LOCAL: Record<string, string> = {
  "/images/tint.webp": IMG.tint,
  "/images/ppf.webp": IMG.ppf,
  "/images/ceramic.webp": IMG.ceramic,
  "/images/dashcam.webp": IMG.dashcam,
  "/images/light.webp": IMG.light,
  "/images/tire.webp": IMG.tire,
  "/images/upg.webp": IMG.decal,
};

const LEGACY_UNSPLASH: Record<string, string> = {
  "/photo-1618843479313-40f8afb4b4d8": IMG.heroCar,
  "/photo-1617814076367-b759c7d7e738": IMG.precisionCar,
  "/photo-1776639520962-dad59bd15197": IMG.interior,
  "/photo-1615775918890-040745dd38d5": IMG.wheel,
  "/photo-1707085301609-10a63d3f0a8e": IMG.tailLight,
  "/photo-1580274455191-1c62238fa333": IMG.blackCar,
  "/photo-1606664515524-ed2f786a0bd6": IMG.graphite,
};

export function resolveImageUrl(src?: string | null): string {
  if (!src) return "";
  if (LEGACY_LOCAL[src]) return LEGACY_LOCAL[src];
  if (!src.startsWith("https://images.unsplash.com/")) return src;
  try {
    const url = new URL(src);
    return LEGACY_UNSPLASH[url.pathname] ?? src;
  } catch {
    return src;
  }
}
