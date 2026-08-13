export type ChecklistItem = {
  id: string;
  label: string;
  href: string;
  citationId: string;
};

export const CHECKLIST: ChecklistItem[] = [
  { id: "vis", label: "Visibility rules (show, drop, or cover a post)", href: "#visibility-rules", citationId: "visibility-rules" },
  { id: "labels", label: "Named label systems (Grox, scarecrow, botmaker)", href: "#readme-not-published", citationId: "readme-not-published" },
  { id: "prompts", label: "Grox prompt files are not in this drop", href: "#grox-prompts-excluded", citationId: "grox-prompts-excluded" },
  { id: "ads", label: "Ads and Who to Follow sit around ranked posts", href: "#ads-who-to-follow", citationId: "ads-who-to-follow" },
  { id: "gpu", label: "The practice ranking run needs a Linux NVIDIA GPU", href: "#phoenix-quickstart-requirements", citationId: "phoenix-quickstart-requirements" },
  { id: "weights", label: "Published scoring weights exist in the code", href: "#scoring-weights", citationId: "scoring-weights" },
];
