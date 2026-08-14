"use client";

import { type ReactNode, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PARALLAX_FACTOR, shouldParallax } from "@/lib/parallax";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const Y_PERCENT = PARALLAX_FACTOR * 50;

export function OpenerParallax({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!shouldParallax(prefersReduced)) return;

      const img = root.current?.querySelector(".opener-img");
      const trigger = root.current?.closest(".opener-frame");
      if (!img || !trigger) return;

      gsap.fromTo(
        img,
        { yPercent: -Y_PERCENT },
        {
          yPercent: Y_PERCENT,
          ease: "none",
          scrollTrigger: {
            trigger,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    },
    { scope: root },
  );

  return <div ref={root}>{children}</div>;
}
