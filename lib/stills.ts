export type Still = {
  id: "drop" | "found" | "scored" | "hide" | "missing" | "run";
  src: string;
  alt: string;
};

export const STILLS: Record<Still["id"], Still> = {
  drop: { id: "drop", src: "/stills/drop.jpg", alt: "A printed dossier on a steel table at night. A published folder, not a live switch." },
  found: { id: "found", src: "/stills/found.jpg", alt: "Two people sorting two piles of printed cards: accounts you follow versus everyone else." },
  scored: { id: "scored", src: "/stills/scored.jpg", alt: "Hands ranking printed cards on a night desk. The published weights sit in the text, not in the photo." },
  hide: { id: "hide", src: "/stills/hide.jpg", alt: "A hand holding a phone with frosted glass over the post. Shown, dropped, or covered." },
  missing: { id: "missing", src: "/stills/missing.jpg", alt: "An open metal drawer with empty slots. Some files were not published." },
  run: { id: "run", src: "/stills/run.jpg", alt: "One adult at a Linux workstation with a visible GPU. The practice run needs that machine." },
};
