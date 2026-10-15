import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "A Sky full of hopes — AURORA",
  description: "A little music, a little magic, and a sky full of wishes.",
};

export const viewport: Viewport = { themeColor: "#08121c" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
