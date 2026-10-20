export default function PageHero({
  eyebrow,
  heading,
  accent,
  intro,
  children,
}: {
  eyebrow: string;
  heading: string;
  accent?: string;
  intro?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(100deg,#ffffff_0%,#f1f1f2_60%,#e7e8ea_100%)]">
      <div aria-hidden className="diag-accent pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display mt-3 text-[clamp(3rem,8vw,6.25rem)] text-ink">
          {heading} {accent && <span className="text-race">{accent}</span>}
        </h1>
        {intro && <p className="mt-5 max-w-2xl text-base leading-relaxed text-graphite">{intro}</p>}
        {children}
      </div>
    </section>
  );
}
