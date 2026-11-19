export default function PageHero({
  eyebrow,
  heading,
  accent,
  intro,
  h1,
  children,
}: {
  eyebrow: string;
  /** Keyword-rich page H1 (e.g. "Contact Haven Customs in Scarborough"). When set, the display line is decorative. */
  h1?: string;
  heading: string;
  accent?: string;
  intro?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(100deg,#ffffff_0%,#f1f1f2_60%,#e7e8ea_100%)]">
      <div aria-hidden className="diag-accent pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        {h1 ? <h1 className="eyebrow">{h1}</h1> : <p className="eyebrow">{eyebrow}</p>}
        {(() => {
          const Tag = h1 ? "p" : "h1";
          return (
            <Tag className="display mt-3 text-[clamp(3rem,8vw,6.25rem)] text-ink">
              {heading} {accent && <span className="text-race">{accent}</span>}
            </Tag>
          );
        })()}
        {intro && <p className="mt-5 max-w-2xl text-base leading-relaxed text-graphite">{intro}</p>}
        {children}
      </div>
    </section>
  );
}
