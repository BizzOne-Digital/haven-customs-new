import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import Arrow from "@/components/site/Arrow";

type Props = {
  line1: string;
  line2: string;
  tagline: string;
  text: string;
  image: string;
  imageAlt: string;
  mode: string;
};

/**
 * Signature hero: oversized italic type with the vehicle layered across both lines.
 * `--fs` drives every measurement so the composition scales as one unit.
 */
export default function Hero({ line1, line2, tagline, text, image, imageAlt, mode }: Props) {
  const cutout = mode === "cutout";
  return (
    <section data-no-reveal className="relative overflow-hidden bg-[radial-gradient(120%_90%_at_30%_40%,#ffffff_0%,#f1f1f2_55%,#e6e7e9_100%)]">
      <div aria-hidden className="diag-accent pointer-events-none absolute inset-0" />
      <div className="relative mx-auto grid max-w-[1320px] gap-8 px-4 pb-12 pt-8 sm:px-6 sm:pt-10 lg:grid-cols-[1fr_300px] lg:gap-6 lg:px-10 lg:pb-16 lg:pt-6">
        <div className="relative [--fs:clamp(4.4rem,19.5vw,9.5rem)] lg:[--fs:min(13.6vw,14.25rem)]">
          <h1 className="relative">
            <span className="display hero-in-left relative z-0 block text-race" style={{ fontSize: "var(--fs)" }}>
              {line1}
            </span>
            <span
              className="display metal hero-in-right relative z-0 block pb-[0.06em] pl-[0.02em]"
              style={{ fontSize: "var(--fs)", marginTop: "calc(var(--fs) * 0.5)" }}
            >
              {line2}
            </span>
          </h1>

          {/* Vehicle layer — overlaps both lines */}
          <div
            className="hero-drive absolute z-10"
            style={{
              left: "calc(var(--fs) * 0.95)",
              top: "calc(var(--fs) * 0.56)",
              width: "calc(var(--fs) * 2.55)",
              aspectRatio: cutout ? "2.1 / 1" : "2.5 / 1",
            }}
          >
            {cutout ? (
              <SafeImage
                src={image}
                alt={imageAlt}
                fill
                priority
                sizes="(min-width:1024px) 640px, 90vw"
                className="object-contain drop-shadow-[0_28px_28px_rgba(0,0,0,0.35)]"
              />
            ) : (
              <div className="relative h-full w-full shadow-[0_30px_50px_-20px_rgba(0,0,0,0.55)] [clip-path:polygon(7%_0,100%_0,93%_100%,0_100%)]">
                <SafeImage
                  src={image}
                  alt={imageAlt}
                  fill
                  priority
                  sizes="(min-width:1024px) 680px, 92vw"
                  className="object-cover object-[50%_62%]"
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/10" />
              </div>
            )}
          </div>
        </div>

        {/* Right column (desktop) / stacked copy (mobile) */}
        <div className="hero-fade flex flex-col items-center text-center lg:items-start lg:justify-center lg:pt-24 lg:text-left">
          <span aria-hidden className="mb-6 hidden h-[4px] w-14 bg-race lg:block" />
          <p className="whitespace-pre-line text-base font-bold uppercase tracking-[0.22em] text-ink lg:text-[1.6rem] lg:leading-tight lg:tracking-[0.06em]">
            <span className="lg:hidden">{tagline.replace(/\n/g, " ")}</span>
            <span className="hidden lg:inline">{tagline}</span>
          </p>
          <p className="mt-5 max-w-[20rem] text-[1.05rem] leading-relaxed lg:text-[1.2rem] text-graphite">{text}</p>
          <Link href="/contact" className="btn btn-red mt-7 min-h-[54px]! px-9! text-base!">
            Get a Quote <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}
