import type { Citation } from "./types";

export function githubPermalink(citation: Citation): string {
  return `https://github.com/${citation.repo}/blob/${citation.commit}/${citation.path}#L${citation.start_line}-L${citation.end_line}`;
}
