import { type CreatureCategory, categoryOf } from "@neon-spore/content";
import { BRUSH_KIND, BRUSHES, type Brush } from "./brushes.js";

/**
 * How the palette is divided into sections. Split from `brushes.ts` when that
 * file went over the line limit — the list of brushes is one thing, the order
 * they are shown in is another, and only this half knows about categories.
 */

const CATEGORY_LABEL: Record<CreatureCategory, string> = {
  cannon: "CANNON",
  shield: "SHIELD",
  mixed: "MIXED",
  special: "SPECIAL",
};

export interface BrushGroup {
  label: string;
  brushes: Brush[];
}

/**
 * Section headers for the palette. A group's membership traces back to
 * `categoryOf` — the category of the kind a brush paints — rather than being
 * retyped a second time here. Pods have no `CreatureKind` and go in their own
 * literal `SUCK` group. A category with nothing in it today (`special`) is
 * left out entirely rather than shown with no buttons under it — `bindPalette`
 * in palette.ts applies the same rule again at render time for a group every
 * brush of which the current wave hides.
 *
 * **`ERASE` is deliberately not here.** It is a tool action rather than a
 * creature, and it used to sit last, in a group of its own, at the bottom of a
 * palette the author scrolls. It now lives under the map with the selected
 * cell's own controls (`cell-panel.ts`), which is where the other two ways of
 * removing something already are — the `Delete` key and the held press. It is
 * still a `Brush` and `paint` still answers it; only the button moved.
 */
export const BRUSH_GROUPS: BrushGroup[] = (() => {
  const byCategory = new Map<CreatureCategory, Brush[]>();
  for (const { brush } of BRUSHES) {
    const kind = BRUSH_KIND[brush];
    if (!kind) continue;
    const category = categoryOf(kind);
    const list = byCategory.get(category) ?? [];
    list.push(brush);
    byCategory.set(category, list);
  }

  const groups: BrushGroup[] = [];
  for (const category of [
    "cannon",
    "shield",
    "mixed",
    "special",
  ] as const satisfies CreatureCategory[]) {
    const brushes = byCategory.get(category);
    if (brushes?.length) groups.push({ label: CATEGORY_LABEL[category], brushes });
  }
  groups.push({ label: "SUCK", brushes: ["mend", "purge", "ward"] });
  return groups;
})();
