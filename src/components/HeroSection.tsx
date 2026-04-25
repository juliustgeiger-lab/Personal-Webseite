"use client";

import { useEffect, useRef, useState } from "react";
import InvisibleWord, { type InvisibleWordState } from "./InvisibleWord";
import ScrollCue from "./ScrollCue";

// The hero locks page scroll until the user has hovered both `invisible`
// and `uncertain`. The scroll cue only appears once unlocked. `unwritten`
// is not gated — the user can keep cycling through it after unlock.
export default function HeroSection() {
  const seenRef = useRef({ invisible: false, uncertain: false });
  const [unlocked, setUnlocked] = useState(false);

  const handleProgress = (state: InvisibleWordState) => {
    if (state === "invisible" || state === "uncertain") {
      seenRef.current[state] = true;
      if (
        seenRef.current.invisible &&
        seenRef.current.uncertain &&
        !unlocked
      ) {
        setUnlocked(true);
      }
    }
  };

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    if (unlocked) {
      html.style.overflow = "";
      body.style.overflow = "";
    } else {
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
    }
    return () => {
      html.style.overflow = "";
      body.style.overflow = "";
    };
  }, [unlocked]);

  return (
    <section className="hero">
      <h1 className="hero-headline">
        <span className="line">The future is</span>
        <span className="line">
          <InvisibleWord onProgress={handleProgress} />
        </span>
      </h1>

      <ScrollCue visible={unlocked} />
    </section>
  );
}
