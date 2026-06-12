import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getAppMode } from "@/lib/mode";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Voice Profile MD Generator",
  description:
    "Distill a creator's real voice into a citation-backed markdown profile Claude can write with.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { mode } = getAppMode();
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="border-b border-border bg-card/60">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="font-serif text-lg font-semibold tracking-tight">
                Voice Profile <span className="text-primary">MD</span> Generator
              </span>
            </Link>
            {mode === "demo" ? (
              <Badge variant="warning">Demo mode — no API keys</Badge>
            ) : (
              <Badge variant="success">Full mode</Badge>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 pb-8 pt-4 text-xs text-muted-foreground">
          Every claim in a generated profile is backed by a verbatim quote, verified by code — the
          model writes, code certifies.
        </footer>
      </body>
    </html>
  );
}
