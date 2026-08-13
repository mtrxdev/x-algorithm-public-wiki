import fs from "node:fs";
import path from "node:path";
import type { Manifest } from "./types";

export function loadManifest(rootDir: string): Manifest {
  const raw = fs.readFileSync(path.join(rootDir, "content", "manifest.json"), "utf8");
  return JSON.parse(raw) as Manifest;
}
