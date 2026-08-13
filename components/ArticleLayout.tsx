import type { ReactNode } from "react";
import { TableOfContents } from "./TableOfContents";
import type { Heading } from "@/lib/headings";

export function ArticleLayout({
  children,
  headings,
  commit,
  fetchedAt,
}: {
  children: ReactNode;
  headings: Heading[];
  commit: string;
  fetchedAt: string;
}) {
  const short = commit.slice(0, 7);
  return (
    <div className="shell">
      <TableOfContents headings={headings} />
      <div>
        <p className="kicker">Independent explainer of public code</p>
        <header>
          <h1>What the public ranking files say about your posts</h1>
          <p className="lede">
            A plain-language report on the public GitHub repository
            xai-org/x-algorithm. This page is not X, not the live feed, and
            not a score for your account.
          </p>
        </header>
        {children}
        <footer className="cite">
          Checked against xai-org/x-algorithm commit {short} on {fetchedAt}.
        </footer>
      </div>
    </div>
  );
}
