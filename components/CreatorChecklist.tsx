import { CHECKLIST } from "@/lib/checklist";

export function CreatorChecklist() {
  return (
    <nav className="checklist" aria-label="What the files say can affect a post">
      <p className="kicker">What the files say can affect a post</p>
      <p>These are named systems in the public folder. This is not a score for your account.</p>
      <ol>
        {CHECKLIST.map((item) => (
          <li key={item.id}>
            <a href={item.href}>{item.label}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
