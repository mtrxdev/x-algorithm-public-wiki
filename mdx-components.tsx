import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
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
