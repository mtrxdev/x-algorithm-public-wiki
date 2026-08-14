import type { ReactNode } from "react";
import { Newsreader, Roboto } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-display" });
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-ui" });

export const metadata = {
  title: "What the public ranking files say about your posts",
  description:
    "An independent explainer of the public x-algorithm files. This is not a score and not the live feed.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${roboto.variable}`}>
      <body>{children}</body>
    </html>
  );
}
