import fs from "node:fs";
import path from "path";
import Article from "../content/article.mdx";
import { ArticleLayout } from "@/components/ArticleLayout";
import { extractHeadings } from "@/lib/headings";

export default function Page() {
  const source = fs.readFileSync(path.join(process.cwd(), "content/article.mdx"), "utf8");
  const headings = extractHeadings(source);
  return (
    <ArticleLayout headings={headings} commit="unknown" fetchedAt="not-yet">
      <Article />
    </ArticleLayout>
  );
}
