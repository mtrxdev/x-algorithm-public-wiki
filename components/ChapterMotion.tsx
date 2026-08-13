"use client";

import { type ReactNode, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { shouldAnimate } from "@/lib/motion";

gsap.registerPlugin(useGSAP);

export function ChapterMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!shouldAnimate(prefersReduced)) return;

      gsap.fromTo(
        "h2",
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" },
      );
    },
    { scope: root },
  );

  return (
    <div className="shell" ref={root}>
      {children}
    </div>
  );
}
