import type { CreatureKind } from "@neon-spore/sim";
import { HOLD, POISE, SWAY_PUMP, TILT_RIPPLE } from "./motions.js";
import type { OwnMotion } from "./own-motion.js";
import { BULB, type CreatureSilhouette, DART, SLICK, THROB } from "./silhouettes.js";

/**
 * Which kinds are drawn as a body of their own, and what that body looks like
 * — one row for every `CreatureKind`, and the only place either half is said.
 *
 * **Why one table and not two.** The contour lived in `silhouettes.ts` and the
 * own-motion in `motions.ts`, each as a ternary chain ending in a default, and
 * they were two hand-kept answers to a single question: *is this kind a body,
 * and which one*. Two lists over one fact drift — a kind reaching one chain and
 * not the other draws its own shape with the slick's sway, which is a body that
 * moves like something it is not. They are one row now, so the pair cannot
 * disagree.
 *
 * **It is total on purpose, and that is the whole point of the file.** Each
 * chain used to end in `: SLICK` and `: TILT_RIPPLE`, so a kind added to
 * `CreatureKind` and forgotten here was drawn as a slick, on both phones, with
 * no compile error and no failing test. In a game where a shape has to mean one
 * spoken word every time, a body wearing another body's silhouette is the most
 * expensive silent failure there is: the pair say "slick", both of them are
 * looking at one, and only the simulation knows better.
 * `satisfies Record<CreatureKind, …>` makes that omission a build error — a new
 * kind cannot reach the field without an answer here.
 *
 * **`null` is an answer, not a gap.** It means *this kind is never asked*, for
 * one of two reasons. Either it has no body at all — a meteor and the torch are
 * crystals (`crystalPath`), the tether is a line down a column, and the queen
 * and the warden draw themselves from `world.boss` — or it is drawn as the body
 * it wears, and the caller resolves that with `wornKind` first. `lure`,
 * `clasp`, `shell` and `veil` are the second sort: a disguise, a membrane,
 * plating and weather, each laid over a slick or a bulb. Giving any of them a
 * row of its own would be a second answer to the question `wornKind` exists to
 * be the only answer to — and for the lure it would be worse than a drift, it
 * would be a tell.
 */
const LIVING_LOOK = {
  slick: { shape: SLICK, motion: TILT_RIPPLE },
  bulb: { shape: BULB, motion: SWAY_PUMP },
  throb: { shape: THROB, motion: HOLD },
  dart: { shape: DART, motion: POISE },
  // Drawn as the body underneath — resolve with `wornKind` before asking.
  lure: null,
  clasp: null,
  shell: null,
  veil: null,
  // No body of their own: crystals, a line down a column, and the two bosses.
  meteor: null,
  meteorMedium: null,
  meteorFast: null,
  meteorFaster: null,
  meteorFastest: null,
  torch: null,
  queen: null,
  warden: null,
  tether: null,
} as const satisfies Record<CreatureKind, { shape: CreatureSilhouette; motion: OwnMotion } | null>;

/**
 * Whether this kind is drawn as a body with a contour and a motion of its own.
 *
 * The shape sheet reads this rather than keeping its own list of what to leave
 * off, so a kind added to the bestiary reaches the sheet — or stays off it — by
 * the same fact the field draws by, and a card can no longer appear for a body
 * that is really a slick under weather.
 */
export function hasOwnBody(kind: CreatureKind): boolean {
  return LIVING_LOOK[kind] !== null;
}

/**
 * Every kind drawn as a body of its own, in the order the table above writes
 * them — bodies first, which is also the order the shape sheet lays its cards
 * out in. Deliberately *not* `CREATURE_KINDS` order: that list is append-only
 * because its index is the wire value, and a sheet is not a wire.
 */
export function livingBodyKinds(): CreatureKind[] {
  return (Object.keys(LIVING_LOOK) as CreatureKind[]).filter(hasOwnBody);
}

function look(kind: CreatureKind, asked: string): { shape: CreatureSilhouette; motion: OwnMotion } {
  const row = LIVING_LOOK[kind];
  if (row === null) {
    throw new Error(
      `${kind} has no body of its own — resolve it with wornKind before asking ${asked}`,
    );
  }
  return row;
}

/**
 * The silhouette a living kind is drawn with. Call this rather than pairing a
 * kind to a shape by hand at the draw site — the queen's morph blends two of
 * these, and a second copy of the pairing drifts.
 *
 * Asking about a kind with no body throws, which is exactly what the old
 * fallback would not do: the answer is not "draw a slick", it is that the
 * caller skipped `wornKind`. Nothing in the game reaches it — `drawCreatures`
 * routes crystals, bosses and the tether away before `drawLiving` — so the
 * throw guards a bug rather than a case the field plays through.
 */
export function livingSilhouette(kind: CreatureKind): CreatureSilhouette {
  return look(kind, "its silhouette").shape;
}

/**
 * The own-motion a living kind is drawn with, on the same terms as
 * `livingSilhouette` and out of the same row, so a body and its sway are never
 * answers about two different creatures.
 */
export function livingMotion(kind: CreatureKind): OwnMotion {
  return look(kind, "its motion").motion;
}
