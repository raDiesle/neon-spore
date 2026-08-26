import type { MirrorState } from "./simon.js";
import type { Color } from "./types.js";

/**
 * Everything the Bulb Queen encounter remembers between beats. It lives in
 * its own file rather than in `types.ts` because it is not a shared shape:
 * `boss.ts` and `queen-mark.ts` own every field here between them, and
 * nothing else may write one.
 */

export interface QueenState {
  kind: "queen";
  /** The id of the queen in `world.creatures`. */
  creatureId: number;
  /** 0-based phase index. */
  phase: number;
  /** The world beat the current phase started on. */
  phaseBeat: number;
  /** The column the announced bloom will open in, -1 when nothing is announced. */
  tellCol: number;
  /** The colour that bloom is vulnerable to. */
  tellColor: Color | null;
  /**
   * Which of the two marks — one tile either side of her own column — is
   * real this bloom. The other looks identical the whole time it is open
   * and never takes a hit (`queen-mark.ts`).
   */
  weakSide: -1 | 1;
  /**
   * The beat `tellColor` and `weakSide` were last chosen on. render/ runs the
   * mark's morph from one creature into the other off this, so the animation
   * needs no state of its own that a restart could carry over.
   */
  pickBeat: number;
  /**
   * The mark that stayed shut on the bloom that just closed — the one render/
   * balls up and then grows back into the next creature. 0 until the first
   * bloom has closed, which is what keeps a wave from opening on a mark
   * already halfway through shrinking.
   */
  spentSide: -1 | 0 | 1;
  /** The beat the announced bloom opens on, -1 for none. */
  openBeat: number;
  /** The first beat it is closed again, -1 for none. */
  closeBeat: number;
  /** Petals she started the fight with, so a drop in petals can be measured. */
  startPetals: number;
  /** The side her next scripted rock will emerge from: -1 left, 1 right, 0 none pending. */
  dropSide: -1 | 0 | 1;
  /** The beat her last torch broke off her, -1 before the first one has. */
  releaseBeat: number;
  /** Which side it broke off: -1 left, 1 right, 0 none yet. */
  releaseSide: -1 | 0 | 1;
  /** Integers owned by `boss.ts`. Nothing outside it reads them. */
  scratch: number[];
}

/**
 * The boss a wave installed, whichever one it is. A tagged union rather than
 * one widening interface: the two bosses share the slot and nothing else, and
 * a single struct carrying both sets of fields would let `boss.ts` read a
 * `tellColor` off a mirror and get `undefined` at runtime with a clean type
 * check behind it.
 */
export type BossState = QueenState | MirrorState;
