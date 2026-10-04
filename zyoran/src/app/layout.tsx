import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Zyoran — The Intelligence", description: "A personal intelligence universe built around context, memory, and momentum." };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
