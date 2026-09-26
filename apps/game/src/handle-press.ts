import { type Command, hashWorld, step, type World } from "@neon-spore/sim";
import type { InputBuffer } from "./input.js";

/**
 * **The handle's two verbs about a press**: sending one, and asking first
 * whether it would be heard.
 *
 * Cut out of `handle.ts` when the second verb took that file within twenty
 * lines of its ceiling, along a seam it already had: everything here is about
 * one command on its way into the buffer, and everything left there is about
 * clocks, pictures and rounds.
 */
export interface PressVerbs {
  /**
   * One press, into the same buffer the canvas pushes to.
   *
   * Without it a headless caller has every verb a *wave* needs and none a
   * **held control** needs, so the four mechanics whose whole picture is a
   * thumb that is down — THE LID's plates parted, THE WARDEN's hatch, THE
   * MAZE's wheel mid-turn, THE LANCE's full lobe — could only ever be
   * photographed released.
   *
   * It goes through the buffer rather than into `world`, and that is the
   * point of it: a picture taken by writing a field is a picture of a state
   * the game cannot reach. `drain(tick)` stamps it on the next tick
   * `advance` runs, exactly as it stamps a finger's, so a `drag` sent here
   * arrives the same way and through the same rules — including the seat
   * check the round does on it.
   */
  send(player: 1 | 2, command: Command): void;
  /** Whether the next tick would change anything for this press (`wouldHear`). */
  wouldHear(player: 1 | 2, command: Command): boolean;
}

export function pressVerbs(world: World, buffer: InputBuffer): PressVerbs {
  return {
    send: (player, command) => buffer.push(player, command),
    wouldHear: (player, command) => wouldHear(world, player, command, buffer.queued()),
  };
}

/**
 * **Whether the next tick would hear this press**: the world stepped once with
 * it and once without, and the two hashes compared.
 *
 * The simulation refuses a press in silence — a round in its opening, a seat
 * that does not own the control, a body not yet grown into the grip — and a
 * refused press leaves the world exactly as the tick would have left it
 * anyway. `bun run frames` sent SNAKE's spit into the morph four captures in a
 * row and got back four pictures of nothing happening, with nothing in the
 * run to say the press had gone nowhere (`tools/frames/drive.ts` says so now).
 *
 * Asked of two copies, so the world being played is not touched, and only
 * when a caller asks — never on the loop, where it would cost two steps a
 * press. A press whose only effect is on a field `hashWorld` leaves out
 * (`docs/decisions.md` #23) reads as unheard; none of the exceptions is
 * something a press is for.
 *
 * **`ahead` is what is already queued for the same tick**, and both copies
 * step with it. A hold is two or three commands sent on one tick — a grab, a
 * carry, a lift — and asked alone the lift found no hand on the handle and
 * read unheard, though the round heard all three (`tools/frames/drive.ts`).
 */
export function wouldHear(
  world: World,
  player: 1 | 2,
  command: Command,
  ahead: readonly { player: 1 | 2; command: Command }[] = [],
): boolean {
  const quiet = structuredClone(world);
  const pressed = structuredClone(world);
  const earlier = ahead.map((a) => ({ tick: world.tick, ...a }));
  step(quiet, earlier);
  step(pressed, [...earlier, { tick: world.tick, player, command }]);
  return hashWorld(quiet) !== hashWorld(pressed);
}
