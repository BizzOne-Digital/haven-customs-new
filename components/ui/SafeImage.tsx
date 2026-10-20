"use client";

import Image, { type ImageProps } from "next/image";
import { resolveImageUrl } from "@/lib/images";
import { useState } from "react";
import { ImageOff } from "lucide-react";

type Props = Omit<ImageProps, "src" | "alt"> & { src?: string | null; alt: string; fallbackLabel?: string };

function usable(src?: string | null) {
  if (!src) return false;
  if (src.startsWith("/uploads/")) return false; // legacy disk path — not available in production
  if (src.startsWith("blob:") || src.startsWith("data:")) return false;
  return src.startsWith("/") || src.startsWith("https://images.unsplash.com/");
}

/** next/image wrapper that never shows a broken image and never loops on error. */
export default function SafeImage({ src: source, alt, fallbackLabel, className, fill, width, height, ...rest }: Props) {
  const src = resolveImageUrl(source);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const ok = usable(src) && failedSrc !== src;

  if (!ok) {
    return (
      <div
        role="img"
        aria-label={alt || fallbackLabel || "Image unavailable"}
        className={`flex items-center justify-center bg-cloud text-silver ${fill ? "absolute inset-0" : ""} ${className ?? ""}`}
        style={fill ? undefined : { width: Number(width) || undefined, height: Number(height) || undefined }}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <ImageOff aria-hidden className="h-6 w-6" />
          {fallbackLabel && <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em]">{fallbackLabel}</span>}
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src!}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={className}
      unoptimized={src!.endsWith(".gif")}
      onError={() => setFailedSrc(src!)}
      {...rest}
    />
  );
}
