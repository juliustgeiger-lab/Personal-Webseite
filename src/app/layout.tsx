import type { Metadata } from "next";
import { Geist, JetBrains_Mono, Sacramento } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const sacramento = Sacramento({
  variable: "--font-sacramento",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Julius — Decision making, non-ergodic systems & bimodal strategies",
  description:
    "Writing on decision making under deep uncertainty, non-ergodic systems, and bimodal strategies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${jetbrainsMono.variable} ${sacramento.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav className="top">
          <Link href="/" className="brand">
            <span className="dot">※</span>
            <span>Julius</span>
          </Link>
          <div className="links">
            <Link className="link" href="/writing">Essays</Link>
            <Link className="link" href="/#topics">Topics</Link>
            <Link className="link" href="/about">About</Link>
            <Link href="/#subscribe" className="cta">
              Subscribe
              <span className="arrow">→</span>
            </Link>
          </div>
        </nav>

        {children}

        <footer className="site" id="subscribe">
          <div className="footer-inner">
            <div className="footer-grid">
              <div>
                <h3>
                  Get the next essay in your <a href="mailto:hello@example.com">inbox →</a>
                </h3>
              </div>
              <div className="col">
                <span className="mono-up">Subscribe</span>
                <a className="link" href="mailto:hello@example.com">
                  Email newsletter <span className="arr">↗</span>
                </a>
                <a className="link" href="/writing">
                  RSS feed <span className="arr">↗</span>
                </a>
              </div>
              <div className="col">
                <span className="mono-up">Elsewhere</span>
                <a className="link" href="#">X / Twitter <span className="arr">↗</span></a>
                <a className="link" href="#">LinkedIn <span className="arr">↗</span></a>
                <a className="link" href="#">GitHub <span className="arr">↗</span></a>
              </div>
              <div className="col">
                <span className="mono-up">Index</span>
                <Link className="link" href="/writing">All essays <span className="arr">→</span></Link>
                <Link className="link" href="/#topics">Topics <span className="arr">→</span></Link>
                <Link className="link" href="/about">About <span className="arr">→</span></Link>
                <Link className="link" href="/imprint">Imprint <span className="arr">→</span></Link>
                <Link className="link" href="/privacy">Privacy <span className="arr">→</span></Link>
              </div>
            </div>
            <div className="footer-bottom">
              <span className="mono-up">© {new Date().getFullYear()} — Julius</span>
              <span className="mono-up">Set in Geist &amp; JetBrains Mono</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
