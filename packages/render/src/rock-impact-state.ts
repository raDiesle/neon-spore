import type { CreatureKind } from "@neon-spore/sim";

/**
 * One rock on its way into, or off, the hull — the record `rock-impact.ts`
 * keeps per impact. Its own file because the comments on these fields are
 * the account of *why* the replay is shaped as it is, and they had grown
 * past the room the class had left beside them.
 */
export interface Impact {
  kind: CreatureKind;
  /** The creature's id and craters — what `drawRockBody` paints a rock from. */
  seed: number;
  holes: number;
  /** Sinks in and drifts off once it arrives (a miss), or simply fires
   * `onArrive` and is gone (a deflect, which bounces by its own animation,
   * `DeflectFx`, and must not also embed here). */
  embed: boolean;
  /** Screen x at impact — fixed; the drift is computed fresh from it every
   * frame (`currentX`), never accumulated, so there is no running velocity
   * state to jump when the acceleration curve changes phase. */
  x0: number;
  /** Screen y the replayed last fall step starts from — the sim's own
   * `fromRow` the beat the miss happened, the exact row render/ last drew
   * this creature at; never below where it would rest in the skin, because
   * the field pass never draws a rock lower than that (`landing.ts`).
   * Settled on the first `draw` frame, where the skin's height is known. */
  y0: number;
  /** px/s — the same speed every earlier beat of the fall had. */
  fallSpeed: number;
  r: number;
  dir: -1 | 1;
  rotation0: number;
  /** Clock reading at impact — a stuck rock holds this still shape rather than visibly wobbling. */
  spawnTime: number;
  /**
   * How long the replay takes: `y0` down to the hull's real skin over
   * `fallSpeed`. 0 until the first `draw` frame, because the skin's height is
   * only known there — speed is fixed, duration is whatever it takes.
   */
  fallLife: number;
  t: number;
  /** Fires once, the frame the replay reaches the hull's skin. */
  onArrive: (x: number, y: number) => void;
  arrived: boolean;
  /** Whether it drags the torch's streak from the top of the field. */
  tail: boolean;
  /** How many marks it has left on the skin rolling off (`rock-scuffs.ts`). */
  scuffed: number;
}
