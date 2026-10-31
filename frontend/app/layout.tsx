import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "IronLedger",
  description: "Workout tracking & strength progression",
};

const NAV_LINKS = [
  { href: "/",        label: "Dashboard" },
  { href: "/log",     label: "Log Workout" },
  { href: "/history", label: "History" },
  { href: "/progress",label: "Progress" },
  { href: "/import",  label: "Import" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased">
        {/* Top navigation */}
        <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-50">
          <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6">
            <span className="font-bold text-lg tracking-tight text-white">
              🏋️ IronLedger
            </span>
            <div className="flex gap-1 ml-4">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="px-3 py-1.5 rounded-md text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </nav>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
