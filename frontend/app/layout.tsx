import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import ProfileSwitcher from "@/components/ui/ProfileSwitcher";
import EraseHistoryModal from "@/components/ui/EraseHistoryModal";

export const metadata: Metadata = {
  title: "IronLedger — High Performance Workout Analytics",
  description: "Next-gen strength ledger, interactive Bento analytics, and biomechanical muscle dissection.",
};

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/progress", label: "Analytics" },
  { href: "/anatomy", label: "Muscle Anatomy" },
  { href: "/log", label: "Log Workout" },
  { href: "/history", label: "History" },
  { href: "/import", label: "Import" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#09090b] text-zinc-100 font-sans antialiased selection:bg-blue-500/20 selection:text-blue-300">
        <UserProvider>
          {/* Top navigation */}
          <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-40">
            <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-2 group">
                  <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white text-base shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                    ⚡
                  </span>
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                    IronLedger
                  </span>
                </Link>

                <div className="hidden md:flex gap-1">
                  {NAV_LINKS.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Right side profile badge & switcher */}
              <div className="flex items-center gap-3">
                <ProfileSwitcher />
              </div>
            </nav>
          </header>

          <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
          <EraseHistoryModal />
        </UserProvider>
      </body>
    </html>
  );
}
