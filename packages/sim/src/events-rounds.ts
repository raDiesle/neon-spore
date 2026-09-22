import type { MazeVerdictReason } from "./maze-verdict.js";
import type { MirrorStep, MirrorVerdictReason } from "./simon.js";

/**
 * **THE MIRROR's five and THE MAZE's five**, cut off the tail of `events.ts`
 * on 22 September 2026 when that page was at 247 of its 250 lines with a
 * choreographed boss still to come.
 *
 * The seam is the one that page has cut three times already — THE FLEET's
 * five, the choreographed bosses' twelve, the creatures' own — and the rule
 * is the same every time: a full page hands its **last** rows across, never
 * the rows a lane is working on. These two were last, and they belong
 * together for a reason beyond their position: a round is a minigame with
 * rules of its own and coordinates of its own, so `ring`, `sector` and `step`
 * mean nothing on the field and nothing outside the round that owns them
 * (`docs/spec/interludes.md`).
 *
 * `packages/audio/test/bind.test.ts` globs `events-*.ts` off disk rather than
 * reading the union, so a page cut out of this one is heard the moment it
 * exists and there is nothing to register.
 */
export type RoundEvent =
  /**
   * THE MIRROR performed one step of a sequence. `index` is 1-based, and
   * `col` is the column its own cannon was standing in as it did — which is
   * where render/ drops the ghost of a shot it performed.
   */
  | { type: "mirrorShow"; step: MirrorStep; index: number; of: number; col: number }
  /** The pair answered one step of a sequence correctly. */
  | { type: "mirrorEcho"; step: MirrorStep; index: number; of: number }
  /** A round is settled — right or wrong, why, and where it landed. */
  | { type: "mirrorVerdict"; right: boolean; col: number; reason: MirrorVerdictReason }
  | { type: "mirrorDown"; col: number }
  /** Both thumbs landed on the mirror's lobes (`on`), or one left (`mirror-hand.ts`). */
  | { type: "mirrorGrip"; col: number; on: boolean }
  /**
   * The pair fired into one of THE MAZE's three mouths. `col` is the column
   * that mouth hangs over, which is where the shot went in and — if the strand
   * behind it goes nowhere — where the answer comes back out.
   */
  | { type: "mazeCommit"; mouth: number; col: number }
  /**
   * The shot stands one cell further into the wheel. `ring` counts outward
   * from the mouths and `sector` is around, both in the wheel's own
   * coordinates and never the field's: the wheel is not on the grid.
   */
  | { type: "mazeProbe"; ring: number; angleMilli: number; of: number }
  /** A round is settled — right or wrong, why, and the mouth it landed in. */
  | { type: "mazeVerdict"; right: boolean; col: number; reason: MazeVerdictReason }
  | { type: "mazeDown"; col: number }
  // The navigator's thumb landing on the heart (`on`) or leaving it (`maze-hand.ts`).
  | { type: "mazeGrip"; col: number; on: boolean };
