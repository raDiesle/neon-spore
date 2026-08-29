import type { ControlSet } from "@neon-spore/content";
import type { SimEvent, World } from "@neon-spore/sim";
import type { ViewRole } from "./layout.js";

export interface Viewport {
  width: number;
  height: number;
  dpr: number;
}

export interface ViewState {
  world: World;
  /** 0..1 within the current beat. The only interpolation the sim allows. */
  beatPhase: number;
  /** Which of the two screens this is, or both at once while testing. */
  role: ViewRole;
  /**
   * Seconds since the page opened. Own-motion only — a creature's ripple and
   * the membrane's wobble run on wall-clock time because nothing about them
   * touches a tile. The simulation never sees this value.
   */
  time: number;
  /** Seconds since the previous frame, for particles. */
  dt: number;
  /**
   * Everything the simulation reported since the previous frame. `world.events`
   * is cleared every tick and a frame covers several ticks, so the host
   * collects them; effects read this and write nothing back.
   */
  events: readonly SimEvent[];
  /** False while paused, so the field can dim without the loop stopping. */
  running: boolean;
  /**
   * The panel this wave is played on, stated rather than inferred.
   *
   * `world.wave` is a bare index, and it means two different things depending
   * on who holds the `World`: for the shipped game it indexes the shipped
   * `WAVES`, and the two were always built to agree. A host that plays a wave
   * from a *different* array at the same index — the director, editing a
   * draft that has not shipped — has no way to recover the right panel from
   * that number alone, no matter how the lookup is written.
   *
   * So the renderer no longer guesses: leave this unset only when `world.wave`
   * truly does index `WAVES` (that is what `band.ts` and `gauge-round.ts` fall
   * back to), and state it everywhere else. A host that finds itself needing
   * this and skipping it has reintroduced the bug this field exists to close.
   */
  controls?: ControlSet;
}

/**
 * The whole contract between the game and its pixels. Swapping Canvas 2D for
 * PixiJS later means writing a second class here — see docs/architecture.md,
 * "When PixiJS becomes due".
 */
export interface Renderer {
  resize(viewport: Viewport): void;
  draw(view: ViewState): void;
  dispose(): void;
}
