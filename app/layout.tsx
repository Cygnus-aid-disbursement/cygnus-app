import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cygnus",
  description: "Public record of humanitarian aid disbursement programmes on Stellar.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b border-border">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-semibold">
              Cygnus
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/" className="hover:underline">
                Programmes
              </Link>
              <Link href="/verify" className="hover:underline">
                Verify a receipt
              </Link>
              <Link href="/console" className="hover:underline">
                Console
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 py-10 text-sm text-muted-foreground">
          Testnet only, unaudited. The chain proves that funds moved under a stated rule. It does
          not prove that goods were delivered or that the right people received aid.
        </footer>
      </body>
    </html>
  );
}
