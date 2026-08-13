"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { shouldAnimate } from "@/lib/motion";

gsap.registerPlugin(useGSAP);

export function ChapterMotion() {
  useGSAP(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!shouldAnimate(prefersReduced)) return;

    gsap.from(".shell h2", {
      opacity: 0,
      y: 8,
      duration: 0.25,
      ease: "power2.out",
    });
  });

  return null;
}
