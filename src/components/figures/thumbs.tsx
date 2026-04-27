import type { ComponentType } from "react";
import HorizonGlyph from "./HorizonGlyph";

/**
 * Slug → thumbnail glyph registry.
 *
 * For each essay that has a custom glyph, register it here. The landing page
 * (`src/app/page.tsx`) and `/writing` index look up by slug; if no glyph is
 * registered, the card falls back to its existing placeholder thumb.
 *
 * Convention for adding a new essay:
 *   1. Create `src/components/figures/<Name>Glyph.tsx` — server component,
 *      pure SVG, no labels, no motion. ViewBox 200×120, fits the card thumb.
 *   2. Add an entry below: slug → component.
 *   3. (Optional) Create `src/components/figures/<Name>Diagram.tsx` for the
 *      body figure and register it in `mdxComponents` in
 *      `src/app/writing/[slug]/page.tsx`.
 *
 * See `docs/figures.md` for the full system.
 */
export const ESSAY_THUMBS: Record<string, ComponentType> = {
  "why-dying-is-often-hard-but-sometimes-easy": HorizonGlyph,
};

export function getEssayThumb(slug: string): ComponentType | null {
  return ESSAY_THUMBS[slug] ?? null;
}
