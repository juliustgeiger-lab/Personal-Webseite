"use client";

import TypewriterText from "./TypewriterText";

const ENDINGS = [
  "the face of uncertainty.",
  "many parallel universes.",
  "futures we didn't predict.",
  "systems we don't control.",
  "the tails of distributions.",
];

export default function ManyWorldsSection() {
  return (
    <section className="many-worlds">
      <h2 className="many-worlds-headline">
        <span className="many-worlds-headline__lead">Yet…</span>
        Some decisions <em className="emph">perform</em> in
        <br />
        <TypewriterText phrases={ENDINGS} />
      </h2>

      <a href="#essays" className="btn btn-ghost many-worlds-cta">
        Essays
        <span className="arrow">↓</span>
      </a>
    </section>
  );
}
