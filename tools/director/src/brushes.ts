import { CREATURES, type CreatureCategory, categoryOf } from "@neon-spore/content";
import { PALETTE } from "@neon-spore/render";
import { type CreatureKind, isBossBody, isMeteorKind, type RockKind } from "@neon-spore/sim";

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
 * The rock brushes, paired with the kind each one paints. One table instead of
 * a chain of `if`s in both directions, so a sixth tier is one row here.
 *
 * It lives beside the brush list rather than with the edits that use it because
 * both halves of the director need it — `paint.ts` to make an entry from a
 * brush, `query.ts` to read one back — and a copy in either would be the second
 * place the pairing is decided. Putting it in one of them made the two import
 * each other, which is a cycle a module-level `const` does not survive.
 */
export const ROCK_BRUSHES: readonly [Brush, RockKind][] = [
  ["rock", "meteor"],
  ["rockMedium", "meteorMedium"],
  ["rockFast", "meteorFast"],
  ["rockFaster", "meteorFaster"],
  ["rockFastest", "meteorFastest"],
  ["torch", "torch"],
];

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
 * kind but three, and all three exceptions are one fact: a lure has no contour
 * of its own — it is drawn as the body it wears — so its card draws both, the
 * way a two-subject brush already means "this resolves to either".
 * `livingKinds` in the sheet leaves it out for the same reason, and a card
 * here naming "LURE" would draw a blank.
 *
 * A clasp and a shell are the others, and both are the same fact again. Each
 * is drawn as the slick or the bulb inside it — a membrane over the top for
 * one, plating for the other — and neither a membrane nor a plate is a
 * contour, so the sheet has no CLASP or SHELL card and a brush asking for one
 * would draw a blank. Which of the two each resolves to is the authored
 * colour, exactly as it is for a lure: `claspBecomes` and `shellBecomes` are
 * the same call.
 */
function cardSubjects(kind: CreatureKind): string[] {
  if (kind === "lure" || kind === "clasp" || kind === "shell") return ["SLICK", "BULB"];
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
