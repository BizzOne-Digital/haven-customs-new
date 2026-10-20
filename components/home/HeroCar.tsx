"use client";

import { useEffect, useRef } from "react";

/**
 * Motion layer for the hero vehicle:
 * - the drive (right → park → exit left) is CSS .hero-loop; on exit we scroll to #services
 *   (only if the visitor has not scrolled yet) and the car drives back in to park
 * - pointer (fine pointers only): small parallax toward the cursor
 * The idle float lives in CSS (.hero-float) so it runs even before hydration.
 */
export default function HeroCar({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let px = 0;
    let py = 0;
    let frame = 0;

    const apply = () => {
      frame = 0;
      el.style.transform = `translate3d(${px}px, ${py}px, 0)`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      px = (e.clientX / window.innerWidth - 0.5) * 24;
      py = (e.clientY / window.innerHeight - 0.5) * 14;
      schedule();
    };

    window.addEventListener("pointermove", onMove, { passive: true });

    // When the car has driven off to the left, scroll to Services, but only if the visitor
    // is still at the top and has not started scrolling or typing themselves.
    const car = el.closest(".hero-loop");
    let userMoved = false;
    const markMoved = () => {
      userMoved = true;
    };
    const onScroll = () => {
      if (window.scrollY > 40) markMoved();
    };
    window.addEventListener("wheel", markMoved, { passive: true });
    window.addEventListener("touchmove", markMoved, { passive: true });
    window.addEventListener("keydown", markMoved);
    window.addEventListener("scroll", onScroll, { passive: true });
    const onEnd = (e: Event) => {
      if (e.target !== car || (e as AnimationEvent).animationName !== "hero-run") return;
      car?.classList.add("is-returning");
      const services = document.getElementById("services");
      if (!userMoved && services && window.scrollY < 40) services.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    car?.addEventListener("animationend", onEnd);

    return () => {
      car?.removeEventListener("animationend", onEnd);
      window.removeEventListener("wheel", markMoved);
      window.removeEventListener("touchmove", markMoved);
      window.removeEventListener("keydown", markMoved);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div ref={ref} className="h-full w-full transition-transform duration-300 ease-out will-change-transform">
      {/* The hero image faces left (headlights left), matching the right → left drive. */}
      <div className="hero-float relative h-full w-full">{children}</div>
    </div>
  );
}
