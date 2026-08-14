import type { MDXComponents } from "mdx/types";
import { ChapterOpener } from "@/components/ChapterOpener";
import { EvidenceBlock } from "@/components/EvidenceBlock";
import { LimitBlock } from "@/components/LimitBlock";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ChapterOpener,
    EvidenceBlock,
    LimitBlock,
    h2: ({ children }) => {
      const text = String(children);
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      return <h2 id={id}>{children}</h2>;
    },
    h3: ({ children }) => {
      const text = String(children);
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      return <h3 id={id}>{children}</h3>;
    },
    ...components,
  };
}
