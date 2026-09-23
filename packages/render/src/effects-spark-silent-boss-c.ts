import type { SimEvent } from "@neon-spore/sim";

/**
 * **The bosses' half of the not-a-burst list, the third page** — THE GAUGE's
 * four, THE WELL's four and THE RATCHET's twelve.
 *
 * Cut off `effects-spark-silent-boss-b.ts` on 22 September 2026, when THE
 * SPOOL's eleven and THE HASP's fourteen landed on that page in one sitting
 * and left it two lines under its 250-line limit. The seam is the one every
 * page of this list is cut on: the **last** bosses on the full page are
 * handed across whole, with their own comments, and the boss being worked on
 * stays under the comment that argues it.
 *
 * `SILENT` spreads this in place after page two, so `isSilent` still narrows
 * and `burstFor`'s `assertNever` still catches an event named on neither.
 */
export const SILENT_BOSS_C = [
  // THE GAUGE's four, the first events this round has had at all: no burst,
  // because a mark, a miss, a jam and a bind are every one of them a state the
  // plate already redraws every frame (`render/gauge.ts`). Sound is what was
  // missing, and it is bound instead (`packages/audio/src/bind-gauge.ts`).
  "gaugeMark",
  "gaugeMiss",
  "gaugeJam",
  "gaugeBind",
  // THE WELL's four, no burst: the face, its seam and its numerals are redrawn
  // from the boss every frame, and a shower over a clock whose whole job is to
  // agree with the thumb on it would be a look (`docs/looks.md`). Sound is
  // what these four get instead (`packages/audio/src/bind-well.ts`).
  "wellRoll",
  "wellHeld",
  "wellWound",
  "wellHome",
  // THE RATCHET's twelve, no burst: nothing draws the rack yet. A click and
  // jolt on a clean tooth and a flat dead burn belong in a ratchet-fx.ts
  // read above the loop when the look lane draws it (`docs/queue.md`).
  "ratchetEnter",
  "ratchetLit",
  "ratchetSet",
  "ratchetLet",
  "ratchetClick",
  "ratchetBurn",
  "ratchetBolt",
  "ratchetBoltOut",
  "ratchetBoltHit",
  "ratchetOpen",
  "ratchetJam",
  "ratchetOut",
] as const satisfies readonly SimEvent["type"][];
