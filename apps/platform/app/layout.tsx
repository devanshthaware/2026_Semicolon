import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "TruthLayer | Verification infrastructure",
  description: "Trust signals for every claim your AI produces."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
