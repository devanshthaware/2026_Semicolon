import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = { title: "TruthLayer SDK Showcase", description: "A consumer app built entirely with the TruthLayer SDK." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
