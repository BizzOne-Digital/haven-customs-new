"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const SECTIONS = "main section:not([data-no-reveal]), body > footer, main ~ footer";

/** Inline, runs before the page paints: enables motion styles, with a safety net so content never stays hidden. */
export const MOTION_BOOT = `(function(){try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;var d=document.documentElement;d.classList.add('motion');setTimeout(function(){if(!d.classList.contains('motion-ready'))d.classList.add('motion-done')},4000)}catch(e){}})();`;

/** Adds `.is-in` to each section (and the footer) as it scrolls into view; CSS staggers its children. */
export default function RevealOnScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("motion")) return;
    root.classList.add("motion-ready");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    document.querySelectorAll(SECTIONS).forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
