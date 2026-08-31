import { CREATURES, type CreatureCategory, categoryOf } from "@neon-spore/content";
import { PALETTE } from "@neon-spore/render";
import { type CreatureKind, isBossBody, isMeteorKind } from "@neon-spore/sim";

/**
 * What a click paints. A brush rather than a cell that cycles through six
 * states: authoring a wave means putting the same thing in several columns,
 * and a cycle makes that six clicks instead of one.
 *
 * A living creature's brush is its own `CreatureKind` — `"slick"`, `"runt"`,
 * whatever `CREATURES` names it — not a colour. A colour-keyed brush
 * (`"red"` → slick, `"cyan"` → bulb) cannot say what a Runt or a Throb is:
 * both carry `color: null` (`packages/content/src/creatures.ts`), so the only
 * name either of them has is its kind. Rocks keep their own literal names —
 * `"rock"`, `"rockMedium"`, … — because five tiers share one kind-shape and a
 * sixth is a new row in `ROCK_BRUSHES` (state.ts), not a new kind.
 */
export type Brush =
  | CreatureKind
  | "rock"
  | "rockMedium"
  | "rockFast"
  | "rockFaster"
  | "rockFastest"
  | "mend"
  | "purge"
  | "ward"
  | "erase";

/**
 * The living kinds a brush paints one-to-one: everything in `CREATURES` that
 * is neither a rock (`isMeteorKind` — its own tier table below), nor a boss
 * body (`isBossBody` — placed by the boss panel, never by a click), nor the
 * one `"special"` kind, the tether, which a boss installs rather than a wave
 * author (`categoryOf`). `tools/shape-sheet/src/subjects.ts`'s `livingKinds`
 * draws the same line for the same reason, on the same three calls — this is
 * not a second copy of a rule, it is the rule read twice for two different
 * questions ("what does the sheet draw" there, "what can a click place" here).
 *
 * Every key of `CREATURES` is covered by exactly one of "rock", "boss body",
 * "special", or this list — so a creature added there needs nothing done here
 * to get a brush, and `brushes.test.ts` fails if that ever stops being true.
 */
export const LIVING_BRUSH_KINDS: CreatureKind[] = (Object.keys(CREATURES) as CreatureKind[]).filter(
  (kind) => !isMeteorKind(kind) && !isBossBody(kind) && categoryOf(kind) !== "special",
);

/** The stroke a living creature's card is drawn in — its own colour, or the
 * neutral one `render/creatures.ts` gives anything that carries none. */
function livingStroke(kind: CreatureKind): string {
  const color = CREATURES[kind].color;
  if (color === "red") return PALETTE.red;
  if (color === "cyan") return PALETTE.cyan;
  return PALETTE.dim;
}

/**
 * The shape-sheet cards a brush's own card draws. A kind's own name for every
 * kind but two, and both exceptions are the same fact: a lure has no contour
 * of its own — it is drawn as the body it wears — so its card draws both, the
 * way a two-subject brush already means "this resolves to either".
 * `livingKinds` in the sheet leaves it out for the same reason, and a card
 * here naming "LURE" would draw a blank.
 *
 * A clasp is the second. It is drawn as the slick or the bulb inside it with a
 * shield over the top, and the shield is a membrane rather than a contour, so
 * the sheet has no CLASP card either and a brush asking for one draws nothing.
 * Which of the two it resolves to is the authored colour, exactly as it is for
 * a lure — and after the ward lands it *is* one of them (`clasp.ts`).
 */
function cardSubjects(kind: CreatureKind): string[] {
  if (kind === "lure" || kind === "clasp") return ["SLICK", "BULB"];
  return [kind.toUpperCase()];
}

const LIVING_BRUSHES: {
  brush: Brush;
  label: string;
  subjects: string[];
  stroke: string;
  note: string;
}[] = LIVING_BRUSH_KINDS.map((kind) => ({
  brush: kind,
  label: kind.toUpperCase(),
  subjects: cardSubjects(kind),
  stroke: livingStroke(kind),
  note: CREATURES[kind].blurb,
}));

export const BRUSHES: {
  brush: Brush;
  label: string;
  /** SUBJECTS names drawn on the card. Two means the brush resolves to either. */
  subjects: string[];
  stroke: string;
  note: string;
}[] = [
  ...LIVING_BRUSHES,
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

/**
 * The creature kind a brush paints, for brushes that paint one at all. Every
 * living brush paints the kind of its own name — `BRUSH_KIND.slick` is
 * `"slick"` — because that is what "a brush is a `CreatureKind`" means; only
 * the rock tiers need a table at all, since `"rock"` and `"meteor"` are not
 * the same string.
 */
export const BRUSH_KIND: Partial<Record<Brush, CreatureKind>> = {
  ...Object.fromEntries(LIVING_BRUSH_KINDS.map((kind) => [kind, kind])),
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
