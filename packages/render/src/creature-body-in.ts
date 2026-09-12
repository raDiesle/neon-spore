import type { Creature, World } from "@neon-spore/sim";
import type { Layout } from "./layout.js";

/**
 * **What a body draw is handed.**
 *
 * Cut out of `creature-body.ts` when THE BALLOON's row took that file over its
 * 250-line limit, along the seam `touch-field.ts` was cut from `touch.ts`:
 * this is a *shape*, and next door is the decision procedure that reads one.
 * It is also the half that is scrolled past — every field on it is a fact some
 * one draw path happens to need, and each arrived on its own.
 *
 * Re-exported from `creature-body.ts`, so nothing that already reached for a
 * `Body` through that file had to move.
 */
export type Body = {
  ctx: CanvasRenderingContext2D;
  l: Layout;
  world: World;
  c: Creature;
  /** The body's centre on screen, already placed by rim or by column. */
  x: number;
  y: number;
  time: number;
  /** The pose clock, in beats: `world.beat + beatPhase`. */
  beats: number;
  beatPhase: number;
  near: number;
  /** How long each body has been reading as blocked, by creature id. */
  blocked: ReadonlyMap<number, number>;
  /** How far a recoil's colour has turned over, 0 at the hit and 1 once it
   * has landed — `turnedTrio`'s argument. One for every other body. Handed in
   * rather than read here because the throw that carries it is a transient
   * (`recoil-leap.ts`), and a draw path reads no transient of its own. */
  turn: number;
  /** Where a torch's streak starts when it was thrown out of THE COIL's dome
   * rather than fell: the dome's tile. Absent for every other body and for
   * a torch that fell (`coil-flight.ts`). */
  tailFrom?: { x: number; y: number };
};
