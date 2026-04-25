"use client";

import { useEffect, useRef, useState } from "react";
import InvisibleWord, { type InvisibleWordState } from "./InvisibleWord";
import ScrollCue from "./ScrollCue";

const UNLOCK_KEY = "hero-unlocked";

// The hero locks page scroll until the user has hovered both `invisible`
// and `uncertain`. The scroll cue only appears once unlocked. The unlock
// is persisted to localStorage so returning users aren't gated again.
export default function HeroSection() {
  const seenRef = useRef({ invisible: false, uncertain: false });
  const [unlocked, setUnlocked] = useState(false);

  // On mount: kill the browser's scroll-restoration (otherwise a reload can
  // drop us in the middle of Beat 2 with the lock still active = stuck), then
  // force scroll to the top, then check whether the user has unlocked before.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
    } catch {}
    try {
      const persisted = window.localStorage.getItem(UNLOCK_KEY) === "1";
      if (persisted) {
        setUnlocked(true);
      } else {
        window.scrollTo(0, 0);
      }
    } catch {
      // localStorage may throw in private mode — fall back to gated state.
      window.scrollTo(0, 0);
    }
  }, []);

  const handleProgress = (state: InvisibleWordState) => {
    if (state === "invisible" || state === "uncertain") {
      seenRef.current[state] = true;
      if (
        seenRef.current.invisible &&
        seenRef.current.uncertain &&
        !unlocked
      ) {
        setUnlocked(true);
        try {
          window.localStorage.setItem(UNLOCK_KEY, "1");
        } catch {}
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
