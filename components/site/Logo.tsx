import Image from "next/image";
import Link from "next/link";

/** Original Haven Customs logo (448×226). Height-driven so the aspect ratio is always preserved. */
export default function Logo({ className = "h-12", priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Link href="/" aria-label="Haven Customs — home" className="inline-flex shrink-0">
      <Image
        src="/logo.png"
        alt="Haven Customs"
        width={448}
        height={226}
        priority={priority}
        className={`w-auto drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.35)] ${className}`}
        sizes="400px"
        quality={85}
      />
    </Link>
  );
}
