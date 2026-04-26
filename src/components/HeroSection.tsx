"use client";

import InvisibleWord from "./InvisibleWord";
import ScrollCue from "./ScrollCue";

export default function HeroSection() {
  return (
    <section className="hero">
      <h1 className="hero-headline">
        <span className="line">The future is</span>
        <span className="line">
          <InvisibleWord />
        </span>
      </h1>

      <ScrollCue />
    </section>
  );
}
