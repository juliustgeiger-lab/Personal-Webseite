"use client";

import { useEffect, useRef, useState } from "react";

// Self-contained glitch effect for the word "uncertain". Designed for unease,
// not aesthetics — long stretches of perfect stillness, broken by sharp,
// short bursts (sliced channels, letter substitution, RGB-split). Independent
// scheduler for total failures (briefly blank or scrambled).

const LOOKALIKES: Record<string, string[]> = {
  a: ["а", "ɑ", "α"],
  c: ["с", "ϲ"],
  e: ["е", "ҽ", "ε"],
  i: ["і", "ı"],
  n: ["ո"],
  o: ["о", "ο"],
  r: ["г"],
  t: ["τ"],
  u: ["υ", "ս"],
};

type Slice = {
  top: number; // %
  height: number; // %
  dx: number; // px
};

type Frame = {
  channelsOn: boolean;
  redDx: number;
  blueDx: number;
  slices: Slice[];
  letterOverrides: Record<number, string>;
  blank: boolean;
};

const IDLE: Frame = {
  channelsOn: false,
  redDx: 0,
  blueDx: 0,
  slices: [],
  letterOverrides: {},
  blank: false,
};

const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const randInt = (min: number, max: number) =>
  Math.floor(rand(min, max + 1));

function pickLookalike(ch: string): string | null {
  const subs = LOOKALIKES[ch.toLowerCase()];
  if (!subs) return null;
  return subs[Math.floor(Math.random() * subs.length)];
}

function makeBurstFrame(text: string): Frame {
  // 2–6 horizontal slice tears (always at least 2 — burst should be obvious)
  const numSlices = randInt(2, 6);
  const slices: Slice[] = [];
  for (let i = 0; i < numSlices; i++) {
    slices.push({
      top: rand(0, 86),
      height: rand(6, 32),
      dx: Math.round(rand(-16, 16)),
    });
  }

  // 1–3 letter substitutions for one frame only (always at least 1)
  const overrides: Record<number, string> = {};
  const numOverrides = randInt(1, 3);
  const used = new Set<number>();
  for (let n = 0; n < numOverrides; n++) {
    let idx = randInt(0, text.length - 1);
    let attempts = 0;
    while (used.has(idx) && attempts < 5) {
      idx = randInt(0, text.length - 1);
      attempts++;
    }
    const sub = pickLookalike(text[idx]);
    if (sub) {
      overrides[idx] = sub;
      used.add(idx);
    }
  }

  // Chromatic offset: red -3..+5, blue mostly opposite — more aggressive split
  const redDx = randInt(-3, 5);
  const blueDx = -redDx + randInt(-1, 1);

  return {
    channelsOn: true,
    redDx,
    blueDx,
    slices,
    letterOverrides: overrides,
    blank: false,
  };
}

function makeScrambledFrame(text: string): Frame {
  const overrides: Record<number, string> = {};
  for (let i = 0; i < text.length; i++) {
    if (Math.random() < 0.75) {
      const sub = pickLookalike(text[i]);
      if (sub) overrides[i] = sub;
    }
  }
  return { ...IDLE, letterOverrides: overrides };
}

export default function UncertainGlitch({ text }: { text: string }) {
  const [frame, setFrame] = useState<Frame>(IDLE);

  // Two independent timer chains, plus a pool for in-burst sub-timers
  const burstChainRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failureChainRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const innerTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const clearInner = () => {
      innerTimersRef.current.forEach((t) => clearTimeout(t));
      innerTimersRef.current = [];
    };

    const runBurst = () => {
      clearInner();
      // Longer, denser bursts — more frames, more impact per burst
      const totalDuration = rand(140, 320);
      const numFrames = randInt(5, 11);
      const frameDuration = totalDuration / numFrames;
      for (let i = 0; i < numFrames; i++) {
        const t = setTimeout(() => {
          setFrame(makeBurstFrame(text));
        }, i * frameDuration);
        innerTimersRef.current.push(t);
      }
      const tEnd = setTimeout(() => {
        setFrame(IDLE);
      }, numFrames * frameDuration);
      innerTimersRef.current.push(tEnd);
    };

    const runFailure = () => {
      clearInner();
      const isBlank = Math.random() < 0.5;
      if (isBlank) {
        setFrame({ ...IDLE, blank: true });
        const t = setTimeout(() => setFrame(IDLE), rand(30, 70));
        innerTimersRef.current.push(t);
      } else {
        setFrame(makeScrambledFrame(text));
        const t = setTimeout(() => setFrame(IDLE), rand(60, 120));
        innerTimersRef.current.push(t);
      }
    };

    const scheduleBurst = () => {
      // Shorter stillness, more frequent ruptures — but still long enough that
      // each glitch lands as a hit, not as continuous noise.
      const delay = rand(900, 2300);
      // ~30% chance of a quick double-tap: a second burst right after the first
      const isDoubleTap = Math.random() < 0.3;
      burstChainRef.current = setTimeout(() => {
        runBurst();
        if (isDoubleTap) {
          const t = setTimeout(() => runBurst(), rand(180, 360));
          innerTimersRef.current.push(t);
        }
        scheduleBurst();
      }, delay);
    };

    const scheduleFailure = () => {
      // Failures hit more often too
      const delay = rand(4500, 10000);
      failureChainRef.current = setTimeout(() => {
        runFailure();
        scheduleFailure();
      }, delay);
    };

    scheduleBurst();
    scheduleFailure();

    return () => {
      if (burstChainRef.current) clearTimeout(burstChainRef.current);
      if (failureChainRef.current) clearTimeout(failureChainRef.current);
      clearInner();
    };
  }, [text]);

  const renderText = text
    .split("")
    .map((c, i) => frame.letterOverrides[i] ?? c)
    .join("");

  const hideStyle = frame.blank ? { visibility: "hidden" as const } : undefined;

  return (
    <>
      <span className="ucg__ghost">{text}</span>
      <span
        className="ucg__channel ucg__channel--r"
        aria-hidden="true"
        style={{
          transform: `translateX(${frame.redDx}px)`,
          opacity: frame.channelsOn ? 1 : 0,
          ...hideStyle,
        }}
      >
        {renderText}
      </span>
      <span
        className="ucg__channel ucg__channel--b"
        aria-hidden="true"
        style={{
          transform: `translateX(${frame.blueDx}px)`,
          opacity: frame.channelsOn ? 1 : 0,
          ...hideStyle,
        }}
      >
        {renderText}
      </span>
      <span className="ucg__main" aria-hidden="true" style={hideStyle}>
        {renderText}
      </span>
      {frame.slices.map((slice, i) => (
        <span
          key={i}
          className="ucg__slice"
          aria-hidden="true"
          style={{
            clipPath: `inset(${slice.top}% 0% ${Math.max(0, 100 - slice.top - slice.height)}% 0%)`,
          }}
        >
          <span
            className="ucg__slice-inner"
            style={{ transform: `translateX(${slice.dx}px)` }}
          >
            {renderText}
          </span>
        </span>
      ))}
    </>
  );
}
