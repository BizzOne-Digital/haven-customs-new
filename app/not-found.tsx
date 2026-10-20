import Link from "next/link";
import Logo from "@/components/site/Logo";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-pearl px-4 text-center">
      <Logo className="h-16" />
      <h1 className="display text-[clamp(4rem,14vw,9rem)] text-race">404</h1>
      <p className="max-w-md text-graphite">That page isn&apos;t here. It may have moved, or the service is no longer listed.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-outline">Home</Link>
        <Link href="/services" className="btn btn-red">View services</Link>
      </div>
    </main>
  );
}
