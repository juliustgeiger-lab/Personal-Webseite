import type { Metadata } from "next";
import { Geist, JetBrains_Mono, Sacramento, Instrument_Serif } from "next/font/google";
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

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
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
      className={`${geistSans.variable} ${jetbrainsMono.variable} ${sacramento.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav className="top">
          <Link href="/" className="brand">
            <img src="/logo/logo-black.png" alt="" className="dot" />
            <span>Vector</span>
          </Link>
          <div className="links">
            <Link className="link" href="/#topics">Topics</Link>
            <Link className="link" href="/about">About</Link>
            <Link href="/writing" className="cta">
              Essays
              <span className="arrow">→</span>
            </Link>
          </div>
        </nav>

        {children}

        <footer className="site" id="subscribe">
          <div className="footer-inner">
            <div className="footer-grid">
              <div className="footer-lede">
                <h3>
                  Get the next<br />
                  essay in your<br />
                  <a href="mailto:hello@example.com">inbox →</a>
                </h3>
                <div className="footer-monkey-wrap" aria-hidden="true">
                  <img
                    src="/Grafics/Monkey%20White.png"
                    alt=""
                    className="footer-monkey footer-monkey--base"
                  />
                  <img
                    src="/Grafics/monkey_glowing_eyes.png"
                    alt=""
                    className="footer-monkey footer-monkey--glow"
                  />
                </div>
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
                <span className="mono-up">Index</span>
                <Link className="link" href="/writing">All essays <span className="arr">→</span></Link>
                <Link className="link" href="/#topics">Topics <span className="arr">→</span></Link>
                <Link className="link" href="/about">About <span className="arr">→</span></Link>
              </div>
            </div>
            <div className="footer-bottom">
              <span className="mono-up">© Vector — Julius T. Geiger {new Date().getFullYear()}. All rights reserved.</span>
              <div className="footer-bottom-links">
                <Link className="mono-up" href="/imprint">Imprint</Link>
                <Link className="mono-up" href="/privacy">Privacy</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
