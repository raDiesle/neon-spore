import { CREATURES, isInstalled } from "@neon-spore/content";
import {
  type CreatureKind,
  isBossBody,
  isMeteorKind,
  type MalfunctionKind,
  type RockKind,
} from "@neon-spore/sim";

/**
 * **What a brush is**, as opposed to what the palette draws for one.
 *
 * Cut out of `brushes.ts` on 16 September 2026, when THE FLIP's row took that
 * file to 251 lines and had to be paid for by shortening its own argument. The
 * seam was already there and is the one `fault-emitter.ts` drew for
 * `fault-beam-ends.ts`: everything here is a **list** — which strings are
 * brushes, which kind each paints — and what is left next door is the **table**
 * a palette is drawn from, one row per brush with a label, a stroke, its
 * subjects and its note. Only the table grows with the game; the next creature
 * or fault should not have to buy its row by deleting a paragraph.
 *
 * `brushes.ts` re-exports every name here, so nothing that reached for one
 * moved. It imports this file and this file imports nothing of it —
 * `test/import-cycles.test.ts` is what makes that a rule rather than a habit.
 */

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
/**
 * **A fault is a brush too**, one per kind, prefixed so it can never collide
 * with a creature's own name.
 *
 * The owner asked for it on 14 September 2026: a malfunction is *a pencil to
 * be placed on the map*, which means it is picked up in the palette like
 * everything else placed there. What it paints is a whole **beat row** rather
 * than a cell — a fault has no column, it has a row it enters on and a number
 * of rows it holds (`sim/fault-placed.ts`) — so a click anywhere along a row
 * places it at that beat, and clicking it again takes it off.
 */
export const FAULT_BRUSHES = [
  "fault:cannon",
  "fault:shield",
  "fault:steer",
  "fault:codex",
  "fault:handover",
  // **THE FLIP**, the one fault whose brush carries a seat: whose screen is
  // turned is the author's decision, so the palette grows a picker for it
  // beside the cannon's colour, on the row it is placed on (`fault-config.ts`).
  "fault:flip",
  // **THE DARK**, 25 September 2026: the field above the ship put out, and a
  // finger on it the only light (`sim/dark.ts`).
  "fault:dark",
  // **THE LEECH and THE LIMPET**, added on 15 September 2026 when the owner
  // settled what they are: *they should only exist as brush, but once they are
  // placed on a tile, for a defined period of time, the malfunction is
  // applied.* They were `MalfunctionKind`s in the simulation from the day the
  // harpoon landed (`sim/harpoon.ts`) and had no pencil, which is a fault an
  // author could not place and therefore could not have.
  "fault:leech",
  "fault:limpet",
] as const;
export type FaultBrush = (typeof FAULT_BRUSHES)[number];

/** The kind a fault brush places, or null for a brush that is not one. */
export function faultKindOf(brush: Brush): MalfunctionKind | null {
  return (FAULT_BRUSHES as readonly string[]).includes(brush)
    ? (brush.slice("fault:".length) as MalfunctionKind)
    : null;
}

export type Brush = CreatureKind | "rock" | "purge" | "ward" | "erase" | FaultBrush;

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
 * The kinds a brush paints one-to-one: everything in `CREATURES` that is
 * neither a rock (`isMeteorKind` — its own tier table below), nor a boss body
 * (`isBossBody` — placed by the boss panel, never by a click), nor the one
 * kinds a boss or another body installs rather than a wave
 * author (`isInstalled`).
 *
 * **"Living" is one name short since THE FENCE**, which is a wall of current
 * rather than a body and is still exactly what this list is for: one click,
 * one kind, no tier to pick. It is kept here rather than given a hand-written
 * brush beside the rocks because the rocks need one for a reason it does not
 * share — five kinds read back as a single `"rock"` brush — and a second list
 * would be a second place a creature can be forgotten. `tools/shape-sheet/src/subjects.ts`'s `livingKinds`
 * draws the same line for the same reason, on the same three calls — this is
 * not a second copy of a rule, it is the rule read twice for two different
 * questions ("what does the sheet draw" there, "what can a click place" here).
 *
 * Every key of `CREATURES` is covered by exactly one of "rock", "boss body",
 * "installed", or this list — so a creature added there needs nothing done here
 * to get a brush, and `brushes.test.ts` fails if that ever stops being true.
 */
export const LIVING_BRUSH_KINDS: CreatureKind[] = (Object.keys(CREATURES) as CreatureKind[]).filter(
  (kind) => !isMeteorKind(kind) && !isBossBody(kind) && !isInstalled(kind),
);

export const BRUSH_KIND: Partial<Record<Brush, CreatureKind>> = {
  ...Object.fromEntries(LIVING_BRUSH_KINDS.map((kind) => [kind, kind])),
  ...Object.fromEntries(ROCK_BRUSHES),
};
