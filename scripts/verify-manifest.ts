import fs from "node:fs";
import path from "node:path";
import { verifyManifest } from "../lib/verifyManifest";

const root = process.cwd();
const article = fs.readFileSync(path.join(root, "content", "article.mdx"), "utf8");
const articleIds = [...article.matchAll(/id="([^"]+)"/g)].map((match) => match[1]);
const result = verifyManifest(root, articleIds);
if (!result.ok) {
  for (const error of result.errors) {
    console.error(`${error.code}: ${error.message}`);
  }
  process.exit(1);
}
console.log(
  result.vendorPresent
    ? "manifest ok (checked against vendor clone)"
    : "manifest ok (excerpt files present; vendor clone not present)",
);
