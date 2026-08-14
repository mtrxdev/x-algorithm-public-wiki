import type { ReactNode } from "react";
import type { Still } from "@/lib/stills";

export function ChapterOpener({
  still,
  kicker,
  title,
  children,
}: {
  still: Still;
  kicker: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="opener">
      <div className="opener-frame">
        <img className="opener-img" src={still.src} alt={still.alt} width={1920} height={1080} />
        <div className="opener-scrim">
          <p className="kicker">{kicker}</p>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="opener-body">{children}</div>
    </section>
  );
}
