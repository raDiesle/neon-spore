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
