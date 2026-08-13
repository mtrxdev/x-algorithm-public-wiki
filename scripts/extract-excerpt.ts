import fs from "node:fs";
import path from "node:path";

function arg(name: string): string {
  const i = process.argv.indexOf(name);
  if (i === -1 || !process.argv[i + 1]) throw new Error(`missing ${name}`);
  return process.argv[i + 1];
}

const relPath = arg("--path");
const start = Number(arg("--start"));
const end = Number(arg("--end"));
const out = arg("--out");
const source = fs.readFileSync(path.join("vendor/x-algorithm", relPath), "utf8");
const lines = source.split("\n");
const text = lines.slice(start - 1, end).join("\n") + "\n";
fs.mkdirSync("content/excerpts", { recursive: true });
fs.writeFileSync(path.join("content/excerpts", `${out}.txt`), text);
console.log(`wrote content/excerpts/${out}.txt (${end - start + 1} lines)`);
