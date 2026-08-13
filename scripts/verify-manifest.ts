import { verifyManifest } from "../lib/verifyManifest";

const root = process.cwd();
const result = verifyManifest(root);
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
