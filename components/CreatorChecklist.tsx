import { CHECKLIST } from "@/lib/checklist";
import { STILLS, type Still } from "@/lib/stills";

const THUMBS: Record<(typeof CHECKLIST)[number]["id"], Still> = {
  vis: STILLS.hide,
  labels: STILLS.missing,
  prompts: STILLS.drop,
  ads: STILLS.found,
  gpu: STILLS.run,
  weights: STILLS.scored,
};

export function CreatorChecklist() {
  return (
    <nav className="checklist" aria-label="What the files say can affect a post">
      <p className="kicker">What the files say can affect a post</p>
      <p>These are named systems in the public folder. This is not a score for your account.</p>
      <ol>
        {CHECKLIST.map((item) => {
          const still = THUMBS[item.id];
          return (
            <li key={item.id}>
              <a href={item.href}>
                <img
                  className="checklist-thumb"
                  data-still={still.id}
                  src={still.src}
                  alt=""
                  aria-hidden="true"
                  width={56}
                  height={56}
                />
                {item.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
