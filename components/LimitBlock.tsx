import fs from "node:fs";
import path from "node:path";
import { getCitation } from "@/lib/getCitation";
import { githubPermalink } from "@/lib/githubPermalink";
import { loadManifest } from "@/lib/loadManifest";

export function LimitBlock({
  id,
  headline,
  prose,
}: {
  id: string;
  headline: string;
  prose: string;
}) {
  const manifest = loadManifest(process.cwd());
  const citation = getCitation(manifest, id);
  const excerpt = fs.readFileSync(
    path.join(process.cwd(), "content", "excerpts", citation.excerpt_file),
    "utf8",
  );
  return (
    <section className="card">
      <div>
        <h3>{headline}</h3>
        <p>{prose}</p>
        <p className="cite">
          <a href={githubPermalink(citation)}>
            {citation.path}:{citation.start_line}-{citation.end_line} · {citation.commit.slice(0, 7)}
          </a>
        </p>
      </div>
      <pre><code>{excerpt}</code></pre>
    </section>
  );
}
