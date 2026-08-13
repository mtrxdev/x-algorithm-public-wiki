import type { Citation, Manifest } from "./types";

export function getCitation(manifest: Manifest, id: string): Citation {
  const found = manifest.citations.find((c) => c.id === id);
  if (!found) throw new Error(`unknown citation: ${id}`);
  return found;
}
