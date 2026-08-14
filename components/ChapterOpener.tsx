import type { ReactNode } from "react";
import type { Still } from "@/lib/stills";
import { OpenerParallax } from "@/components/OpenerParallax";

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
        <OpenerParallax>
          <img className="opener-img" src={still.src} alt={still.alt} width={1920} height={1080} />
        </OpenerParallax>
        <div className="opener-scrim">
          <p className="kicker">{kicker}</p>
          <p className="opener-title" aria-hidden="true">
            {title}
          </p>
        </div>
      </div>
      <div className="opener-body">{children}</div>
    </section>
  );
}
