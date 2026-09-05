import { CREATURES, categoryOf } from "@neon-spore/content";
import { PALETTE } from "@neon-spore/render";
import { type CreatureKind, isBossBody, isMeteorKind, type RockKind } from "@neon-spore/sim";
import { cardSubjects, livingStroke, SHORT_NOTE } from "./brush-cards.js";

/**
 * What a click paints. A brush rather than a cell that cycles through six
 * states: authoring a wave means putting the same thing in several columns,
 * and a cycle makes that six clicks instead of one.
 *
 * A living creature's brush is its own `CreatureKind` — `"slick"`, `"runt"`,
 * whatever `CREATURES` names it — not a colour. A colour-keyed brush
 * (`"red"` → slick, `"cyan"` → bulb) cannot say what a Runt or a Throb is:
 * both carry `color: null` (`packages/content/src/creatures.ts`), so the only
 * name either of them has is its kind. `"rock"` is the one literal left: five
 * kinds — the five speed tiers — read back as that single brush, because the
 * speed of one arrival is a number on the entry rather than a choice of tool
 * (`brushOf` in query.ts, `entry-fields.ts` for the numbers themselves).
 */
export type Brush = CreatureKind | "rock" | "mend" | "purge" | "ward" | "erase";

/**
 * The rock brushes, paired with the kind each one paints *first*.
 *
 * **There used to be six, and five of them were one brush wearing five
 * speeds.** `METEOR`, `METEOR ×2` … `METEOR ×5` sat in the palette as separate
 * buttons because a tier is a `CreatureKind` and a brush is what places a
 * kind — so the fall speed, which is a *number about one arrival*, was being
 * chosen by picking a different tool. Five buttons that draw the same rock is
 * a palette teaching that the five are five things, and it does not scale: the
 * width added beside the speed would have made it ten.
 *
 * So the palette carries one `METEOR`, which paints the slowest tier, and the
 * speed moves under the map to the panel that configures the cell you are
 * pointing at (`cell-config.ts`). The torch keeps its own brush: it is not a
 * tier — `fallTilesPerBeat` says why — and it is the one rock the pair has a
 * different sentence for.
 *
 * It lives beside the brush list rather than with the edits that use it because
 * both halves of the director need it — `paint.ts` to make an entry from a
 * brush, `query.ts` to read one back — and a copy in either would be the second
 * place the pairing is decided. Putting it in one of them made the two import
 * each other, which is a cycle a module-level `const` does not survive.
 */
export const ROCK_BRUSHES: readonly [Brush, RockKind][] = [
  ["rock", "meteor"],
  ["torch", "torch"],
  ["veer", "veer"],
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

const LIVING_BRUSHES: {
  brush: Brush;
  label: string;
  subjects: string[];
  stroke: string;
  note: string;
  detail: string;
}[] = LIVING_BRUSH_KINDS.map((kind) => ({
  brush: kind,
  label: kind.toUpperCase(),
  subjects: cardSubjects(kind),
  stroke: livingStroke(kind),
  note: SHORT_NOTE[kind] ?? CREATURES[kind].blurb,
  detail: CREATURES[kind].blurb,
}));

export const BRUSHES: {
  brush: Brush;
  label: string;
  /** SUBJECTS names drawn on the card. Two means the brush resolves to either. */
  subjects: string[];
  stroke: string;
  /** The short line in the palette — what the brush is, at a glance. */
  note: string;
  /** The whole sentence, for the hover card. Absent when `note` is already it. */
  detail?: string;
}[] = [
  ...LIVING_BRUSHES,
  {
    brush: "rock",
    label: "METEOR",
    subjects: ["METEOR"],
    stroke: PALETTE.rock,
    note: "cannot be shot, ward it",
    detail: "Dead rock. Cannot be shot. Speed and size are set under the map, per rock.",
  },
  {
    brush: "torch",
    label: "TORCH",
    subjects: ["TORCH"],
    stroke: PALETTE.rock,
    note: SHORT_NOTE.torch ?? CREATURES.torch.blurb,
    detail: CREATURES.torch.blurb,
  },
  {
    brush: "veer",
    label: "VEER",
    // The stone is what the sheet has; the rider on it is drawn by the game
    // and by nothing else (`render/veer-clown.ts`), so the card says METEOR
    // and the note is what tells the two apart in the palette.
    subjects: ["METEOR"],
    stroke: PALETTE.rock,
    note: SHORT_NOTE.veer ?? CREATURES.veer.blurb,
    detail: CREATURES.veer.blurb,
  },
  {
    brush: "mend",
    label: "MEND",
    subjects: ["POD"],
    stroke: PALETTE.pod,
    note: "restores hull",
  },
  {
    brush: "purge",
    label: "PURGE",
    subjects: ["POD"],
    stroke: PALETTE.ember,
    note: "clears the field",
  },
  {
    brush: "ward",
    label: "WARD",
    subjects: ["POD"],
    stroke: PALETTE.shieldRim,
    note: "shield stays armed a few beats",
  },
  {
    brush: "erase",
    label: "ERASE",
    subjects: [],
    stroke: "#574d84",
    note: "takes back the cell",
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
  ...Object.fromEntries(ROCK_BRUSHES),
};
