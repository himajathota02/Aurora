import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const note = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"], style: ["italic"], variable: "--font-note", display: "swap" });

export const metadata: Metadata = {
  title: "A Sky full of hopes — AURORA",
  description: "A little music, a little magic, and a sky full of wishes.",
};

export const viewport: Viewport = { themeColor: "#08121c" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={note.variable}><body>{children}</body></html>;
}