import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Exelta — Zioren Intelligence",
  description: "Exelta is a living intelligence environment powered by Zioren and contextual memory.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
