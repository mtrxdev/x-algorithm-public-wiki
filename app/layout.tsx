import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "What you can actually make from X’s public ranking code",
  description:
    "A layman report on what the public xai-org/x-algorithm repository lets a person make, build, or run.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
