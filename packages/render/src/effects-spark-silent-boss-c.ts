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
  // THE RATCHET's twelve, no burst from this table: they are read above the
  // loop by `ratchet-fx.ts`, THE HASP's way, because a set and a let-go burst
  // on the catch's screens alone and a table row cannot ask whose screen it
  // is. A burnt tooth throws nothing anywhere — §22's one silence.
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
  // THE GORGE's and THE TASTER's first halves, landed after their pages
  // filled: no burst from this table, because each boss's bursts are read
  // above the loop by its own fx file (`gorge-fx.ts`, `taster-fx.ts`).
  "gorgeNick",
  "gorgePryFill",
  "tasterPryFill",
] as const satisfies readonly SimEvent["type"][];
