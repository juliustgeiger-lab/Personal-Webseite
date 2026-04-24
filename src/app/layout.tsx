import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Julius",
  description: "Notes on decision making, value investing, and thinking under uncertainty.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-zinc-900 dark:bg-black dark:text-zinc-100">
        <header className="border-b border-zinc-200 dark:border-zinc-800">
          <nav className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
            <Link href="/" className="font-medium tracking-tight hover:opacity-70 transition-opacity">
              Julius
            </Link>
            <div className="flex gap-6 text-sm text-zinc-600 dark:text-zinc-400">
              <Link href="/writing" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                Writing
              </Link>
              <Link href="/about" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                About
              </Link>
            </div>
          </nav>
        </header>
        <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12 md:py-20">
          {children}
        </main>
        <footer className="border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-2xl mx-auto px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-zinc-500">
            <span>© {new Date().getFullYear()} Julius</span>
            <div className="flex gap-5">
              <Link href="/impressum" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                Impressum
              </Link>
              <Link href="/datenschutz" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                Datenschutz
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
