import type { ControlSet } from "@neon-spore/content";
import type { SimEvent, World } from "@neon-spore/sim";
import type { ViewRole } from "./layout.js";
import type { ShipHand } from "./touch-ship.js";

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
  /**
   * What this device's own hand is doing on the ship, if anything — the ring
   * round the swelling a finger has taken hold of, and which colour player
   * 2's muzzle swipe would fire (`ship-hand.ts`).
   *
   * Per device and never shared: it is a fact about one pair of eyes and one
   * thumb, so it is neither in the world nor on the wire, and the other seat's
   * screen shows nothing of it. Left unset by a host with no pointer of its
   * own — a replay, a thumbnail, a frame test that is not about this.
   */
  hand?: ShipHand;
  /**
   * Bodies only, on flat black: no backdrop, no radar, no grid, no ship, no
   * band and no HUD — just what `drawBodies` puts on the field.
   *
   * Nothing the game runs ever sets it. It exists for a tool that wants one
   * creature's *picture* rather than a picture of the game with a creature in
   * it — the director's brush thumbnails, which are cropped down to a couple
   * of tiles where a starfield and two grid lines are not scenery, they are
   * the whole of what the eye sees first. Drawing the bodies through the
   * shipping renderer and then leaving the field out is what keeps those
   * thumbnails the real shape in the real colour, which a hand-drawn contour
   * never was.
   */
  bare?: boolean;
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
