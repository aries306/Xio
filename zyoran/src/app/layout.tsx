import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vea — Zuna",
  description: "Vea is the intelligence layer of Zuna, the universe built by Zunoverse.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
