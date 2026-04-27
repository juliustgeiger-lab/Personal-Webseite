# Essay figures — style guide

This is the written companion to `/figures` (the live preview route). The
preview page shows the system running. This file says *why* it runs the way
it does, and what to keep stable when designing the next essay's figure.

If you only read one section, read **§3 Two registers per essay**.

---

## §1 The vocabulary

The site already has a settled visual grammar. Every figure inherits it.

### Color tokens

| Token            | Hex       | Role                                                                            |
| ---------------- | --------- | ------------------------------------------------------------------------------- |
| `--ink`          | `#0a0a0a` | Lines, dots, body text. The default.                                            |
| `--ink-2`        | `#171717` | Heavy text, strong emphasis.                                                    |
| `--ink-soft`     | `#525252` | Captions, axis labels, secondary text.                                          |
| `--ink-faint`    | `#a3a3a3` | Ghost lines, far horizons, tertiary marks.                                      |
| `--rule`         | `#ededed` | Borders, hairline rules, the figure-wrapper edge.                               |
| `--rule-2`       | `#f5f5f5` | Card thumb backgrounds, code blocks.                                            |
| **fountain-pen blue** | `#1e3a8a` | The accent. Used **only** for things in motion or being written.            |
| `--green`        | `#10b981` | Reserved for the status pill on the homepage. Not for figures.                  |

The blue is doing a lot of semantic work. It's used in `UnwrittenStroke`
(handwriting fill), `PresentSection` (the typewriter caret and the ripple
expanding from NOW), and `ManyWorlds` (typewriter rotating phrase). When you
see blue, something is being calibrated, written, or decided right now.
Don't use blue for static structure — use ink.

### Stroke weights

- Hairline structure: `1px`
- Slightly stronger for the line you want the eye to land on: `1.5px`
- That's it. No `2px` or thicker. The site is a quiet space.

### Typography

- Body and headlines: Geist Sans, weights 400–800.
- Labels in figures: **JetBrains Mono uppercase**, ~9–11px, letter-spacing
  `0.10em` to `0.14em`.
- Italic asides on the homepage: Instrument Serif italic — only for the
  "But…" / "Yet…" bridges, not in figures.

### Radii and motion

- Card and figure-wrapper radius: 12–16px.
- Pills and chips: `100px`.
- Default easing across the site: `cubic-bezier(0.22, 1, 0.36, 1)`,
  500–700ms. Match this in figures.
- No bounces. No flashes. No purple gradients. Restraint is the point.

---

## §2 Component anatomy

```
src/components/figures/
  EssayFigure.tsx     ← shared wrapper (label, body, controls, caption)
  HorizonDiagram.tsx  ← outcome view (E vs A on a time axis, draggable)
  HorizonLoop.tsx     ← causal view (Strategy ↔ Time Horizon loop)
  HorizonGlyph.tsx    ← thumb glyph for the dying essay
  thumbs.tsx          ← slug → glyph registry
```

`EssayFigure` is the chrome you wrap any in-essay figure in. It gives you:

- a bordered box matching `.fs-wrap` (the existing `FuturesSimulation` look),
- a mono-caps eyebrow label (`§ Fig — Horizon`),
- a slot for controls (chips, resample buttons),
- a slot for a soft-ink caption underneath.

Use it. Don't reinvent the box.

---

## §3 Two registers per essay

Every essay that earns a figure gets **two** components:

### Body figure (interactive)

- Lives inside `EssayFigure` in the post body.
- Auto-cycles through discrete states if the essay has them, otherwise drags
  / hovers / clicks for the reader who lingers.
- Carries chips (state selector) and a one-line caption that fades in per
  state.
- Hover-to-pause on auto-cycle is the default.

### Thumb glyph (still)

- Lives in `src/components/figures/<Name>Glyph.tsx`, registered in
  `thumbs.tsx`.
- Pure SVG. **No labels. No motion. No interaction.** Server component.
- ViewBox roughly 200×120. Scales to fill the card thumb area.
- Reads in under a second as a silhouette of the essay's idea.

The body is the live version of what the thumb is the trace of. Same author,
two volumes.

> Why two? Animating six thumbs in a card grid is busy and burns CPU, and
> motion in a thumb fights with the headline beneath it. A still glyph reads
> instantly and signals "this essay is about *this* shape." The body is
> where the idea moves.

---

## §4 The six rules

Any new figure should satisfy all six.

**A. Hairline strokes only.** 1px or 1.5px. Never thicker.

**B. Blue means motion.** Fountain-pen blue (`#1e3a8a`) only for things
actively being calibrated, written, or in flux. Static structure is ink.

**C. Mono caps for labels.** JetBrains Mono uppercase, ~9–10px, letter-
spacing 0.12–0.14em.

**D. Motion is restraint.** Match the existing easing
(`cubic-bezier(0.22, 1, 0.36, 1)`, ~700ms). No bounces, no flashes.
Auto-cycle ~4–5s if there are discrete states.

**E. Two registers per essay.** Body figure (interactive). Glyph (still).
Always both.

**F. Reduced motion respected.** Wrap any non-essential animation in
`@media (prefers-reduced-motion: reduce)` and let it settle to its final
state.

---

## §5 Adding a new essay's figure

The fill-in-the-blank version:

1. Create `src/components/figures/<Name>Diagram.tsx`. Use `EssayFigure` as
   the wrapper. Follow the rules in §4.
2. Register it in `mdxComponents` in
   `src/app/writing/[slug]/page.tsx`:
   ```ts
   import <Name>Diagram from "@/components/figures/<Name>Diagram";
   const mdxComponents = { FuturesSimulation, HorizonDiagram, <Name>Diagram };
   ```
3. Drop the tag into the .mdx file where the figure should appear.
4. Create `src/components/figures/<Name>Glyph.tsx`. Pure SVG, no labels, no
   motion, viewBox 200×120.
5. Register the glyph in `src/components/figures/thumbs.tsx`:
   ```ts
   export const ESSAY_THUMBS = {
     "<slug>": <Name>Glyph,
     ...
   };
   ```
6. The home page and `/writing` index pick it up automatically.
7. Visit `/figures` to confirm it fits the system. If something looks off
   there, it'll look off in production too.

---

## §6 Patterns to reach for

These are the figure shapes the site already uses well. New figures should
default to one of these, or argue clearly for inventing a new one.

### Pattern A — Monte Carlo paths

Many trajectories from a single starting dot, ranked, with a band that lights
up on cue. Currently: `FuturesSimulation`. Use this when the essay is about
distributions of outcomes, not a single trajectory.

### Pattern B — Single timeline with markers

A horizontal time axis. NOW dot on the left. Markers and bands annotate the
axis. Currently: `HorizonDiagram`. Use this when the essay is about timing,
horizons, or any single linear sequence.

### Pattern C — Sheaf of threads

A small bundle of bounded random walks pulled toward a target. Currently:
`ManyWorldsSection`. Use this when the essay is about multiple paths
converging on a similar quality.

### Pattern D — Single point with aura

One dot, three breathing rings around it, optional speech bubble. Currently:
`PresentSection`. Use this when the essay is about a single moment and the
weight it carries.

### Pattern E — Causal loop

Two nodes connected by directed flows that animate through their cycle.
Currently: `HorizonLoop`. Use this when the essay is about a feedback
relationship between two named things, where one informs the other and the
second one shapes the first in return.

### Pattern F — Draggable axis with markers

A horizontal axis with two or more markers the reader can drag, plus
ambient drift when no one is interacting. Currently: `HorizonDiagram`. Use
this when the essay is about the relationship between two values along the
same dimension and the reader benefits from playing with the gap.

If the next figure doesn't fit any of these, the brief for Claude design
should be: "Here are the four existing patterns and the rules in §4. The
new figure needs to communicate X. Which pattern does it extend, and why?"

---

## §7 Anti-patterns

Things that have crept into other people's "minimal" sites that should not
crawl into this one:

- Heavy gradients, especially purple-to-pink. The accent palette is one blue.
- Shadowed cards that lift on hover. The site uses border-color shifts for
  hover, not shadow.
- Animated SVG dashes that draw forever. Animation has a beginning and an
  end. Long-running motion is reserved for the breathing rings (slow,
  ambient) and the typewriter caret (functional).
- Emojis in figure labels.
- Multiple accent colors. There is one. It's blue.
- Bright greens, reds, yellows. Even error states should be ink-soft.

---

## §8 Where things live

- Code: `src/components/figures/`
- Slug → thumb registry: `src/components/figures/thumbs.tsx`
- MDX component map: `src/app/writing/[slug]/page.tsx`
- CSS: `src/app/globals.css`, search for `=== ESSAY FIGURE SYSTEM ===`
- Live preview: `/figures` (unlisted)
- This doc: `docs/figures.md`
