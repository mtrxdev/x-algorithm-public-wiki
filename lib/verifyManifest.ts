import fs from "node:fs";
import path from "node:path";
import { loadManifest } from "./loadManifest";
import type { VerifyError, VerifyResult } from "./types";

function excerptPath(rootDir: string, excerptFile: string): string {
  return path.join(rootDir, "content", "excerpts", excerptFile);
}

function vendorFile(rootDir: string, rel: string): string {
  return path.join(rootDir, "vendor", "x-algorithm", rel);
}

function sliceLines(text: string, start: number, end: number): string {
  const lines = text.split("\n");
  return lines.slice(start - 1, end).join("\n") + (end >= start ? "\n" : "");
}

export function verifyManifest(rootDir: string, articleIds?: string[]): VerifyResult {
  const errors: VerifyError[] = [];
  const manifest = loadManifest(rootDir);
  const vendorRoot = path.join(rootDir, "vendor", "x-algorithm");
  const vendorPresent = fs.existsSync(vendorRoot);
  const ids = new Set(manifest.citations.map((c) => c.id));

  for (const citation of manifest.citations) {
    const file = excerptPath(rootDir, citation.excerpt_file);
    if (!fs.existsSync(file)) {
      errors.push({
        code: "missing_excerpt",
        message: `missing excerpt ${citation.excerpt_file} for ${citation.id}`,
      });
      continue;
    }
    if (citation.start_line < 1 || citation.end_line < citation.start_line) {
      errors.push({
        code: "invalid_range",
        message: `invalid range for ${citation.id}`,
      });
    }
    if (vendorPresent) {
      const source = vendorFile(rootDir, citation.path);
      if (!fs.existsSync(source)) {
        errors.push({
          code: "excerpt_mismatch",
          message: `vendor missing ${citation.path} for ${citation.id}`,
        });
        continue;
      }
      const expected = sliceLines(
        fs.readFileSync(source, "utf8"),
        citation.start_line,
        citation.end_line,
      );
      const actual = fs.readFileSync(file, "utf8");
      if (actual !== expected) {
        errors.push({
          code: "excerpt_mismatch",
          message: `excerpt does not match ${citation.path}:${citation.start_line}-${citation.end_line}`,
        });
      }
    }
  }

  if (articleIds) {
    for (const id of articleIds) {
      if (!ids.has(id)) {
        errors.push({
          code: "article_unknown_id",
          message: `article cites unknown id ${id}`,
        });
      }
    }
  }

  return { ok: errors.length === 0, errors, vendorPresent };
}
