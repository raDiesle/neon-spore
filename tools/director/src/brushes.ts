import { CREATURES, type CreatureCategory, categoryOf } from "@neon-spore/content";
import { PALETTE } from "@neon-spore/render";
import type { CreatureKind } from "@neon-spore/sim";

/**
 * What a click paints. A brush rather than a cell that cycles through six
 * states: authoring a wave means putting the same thing in several columns,
 * and a cycle makes that six clicks instead of one.
 */
export type Brush =
  | "red"
  | "cyan"
  | "rock"
  | "rockMedium"
  | "rockFast"
  | "rockFaster"
  | "rockFastest"
  | "torch"
  | "mend"
  | "purge"
  | "ward"
  | "erase";

export const BRUSHES: {
  brush: Brush;
  label: string;
  /** SUBJECTS names drawn on the card. Two means the brush resolves to either. */
  subjects: string[];
  stroke: string;
  note: string;
}[] = [
  {
    brush: "red",
    label: "SLICK",
    subjects: ["SLICK"],
    stroke: PALETTE.red,
    note: CREATURES.slick.blurb,
  },
  {
    brush: "cyan",
    label: "BULB",
    subjects: ["BULB"],
    stroke: PALETTE.cyan,
    note: CREATURES.bulb.blurb,
  },
  {
    brush: "rock",
    label: "METEOR",
    subjects: ["METEOR"],
    stroke: PALETTE.rock,
    note: CREATURES.meteor.blurb,
  },
  {
    brush: "rockMedium",
    label: "METEOR ×2",
    subjects: ["METEOR"],
    stroke: PALETTE.rock,
    note: CREATURES.meteorMedium.blurb,
  },
  {
    brush: "rockFast",
    label: "METEOR ×3",
    subjects: ["METEOR"],
    stroke: PALETTE.rock,
    note: CREATURES.meteorFast.blurb,
  },
  {
    brush: "rockFaster",
    label: "METEOR ×4",
    subjects: ["METEOR"],
    stroke: PALETTE.rock,
    note: CREATURES.meteorFaster.blurb,
  },
  {
    brush: "rockFastest",
    label: "METEOR ×5",
    subjects: ["METEOR"],
    stroke: PALETTE.rock,
    note: CREATURES.meteorFastest.blurb,
  },
  {
    brush: "torch",
    label: "TORCH",
    subjects: ["TORCH"],
    stroke: PALETTE.rock,
    note: CREATURES.torch.blurb,
  },
  {
    brush: "mend",
    label: "MEND",
    subjects: ["POD"],
    stroke: PALETTE.pod,
    note: "restores hull — the pod as it has always been",
  },
  {
    brush: "purge",
    label: "PURGE",
    subjects: ["POD"],
    stroke: PALETTE.ember,
    note: "clears every creature on the field",
  },
  {
    brush: "ward",
    label: "WARD",
    subjects: ["POD"],
    stroke: PALETTE.shieldRim,
    note: "holds the shield armed for a few beats, no trigger needed",
  },
  {
    brush: "erase",
    label: "ERASE",
    subjects: [],
    stroke: "#574d84",
    note: "takes back whatever is in the cell, entry or pod",
  },
];

/** The creature kind a brush paints, for brushes that paint one at all. */
const BRUSH_KIND: Partial<Record<Brush, CreatureKind>> = {
  red: "slick",
  cyan: "bulb",
  rock: "meteor",
  rockMedium: "meteorMedium",
  rockFast: "meteorFast",
  rockFaster: "meteorFaster",
  rockFastest: "meteorFastest",
  torch: "torch",
};

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
 * literal `SUCK` group; `ERASE` is a tool action, not a creature, and always
 * comes last, outside every category. A category with nothing in it today
 * (`special`) is left out entirely rather than shown with no buttons under
 * it — `bindPalette` in palette.ts applies the same rule again at render time
 * for a group every brush of which the current wave hides.
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
  groups.push({ label: "ERASE", brushes: ["erase"] });
  return groups;
})();
