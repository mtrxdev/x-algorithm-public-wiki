import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "What the public ranking files say about your posts",
  description:
    "An independent explainer of the public x-algorithm files. This is not a score and not the live feed.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
