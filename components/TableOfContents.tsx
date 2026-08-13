import type { Heading } from "@/lib/headings";

export function TableOfContents({ headings }: { headings: Heading[] }) {
  return (
    <nav className="toc" aria-label="Contents">
      <p className="kicker">Contents</p>
      <ol>
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "h3" : "h2"}>
            <a href={`#${h.id}`}>{h.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
