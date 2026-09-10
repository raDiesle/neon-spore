import type { ControlSet } from "@neon-spore/content";
import type { SimEvent, World } from "@neon-spore/sim";
import type { ViewRole } from "./layout.js";
import type { SeatNames } from "./seat-name.js";
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
   * Where a mouse is resting on the stage, or unset.
   *
   * A desk has a hover and a phone does not, so a host sets this only for a
   * real mouse and clears it when the pointer leaves. Everything that lights up
   * under it reads it from here: the band's controls (`hover.ts`) and the three
   * buttons on a guide's bar (`nav-button.ts`). The ship's own two swellings do
   * not — they were already lit through `hand`, which carries more than a
   * position (`ship-hand.ts`).
   */
  pointer?: { x: number; y: number };
  /**
   * What the two people are called, by seat, blank where nobody has said.
   *
   * The room carries them (`apps/game/src/link.ts`), and the only screens that
   * read them are the ones that address a person rather than a seat: the gate
   * a guide ends on, and the two halves of a written guide. Solo play, the
   * director and every frame test leave it unset, and those screens say PLAYER
   * 1 and PLAYER 2 instead (`seat-name.ts`).
   */
  names?: SeatNames;
  /**
   * How far down from the top of the screen something else already stands.
   *
   * A rehearsal carries a plate top left — TUTORIAL over PLAYER n · SCREEN —
   * that is always there and never fades (`guide-switch.ts`), and a boss round
   * draws a header of its own in the same band. Neither is wrong; what was
   * missing was that a header had never had to make room. So the film says
   * where the plate ends, and a round's header and the HUD's lower rows start
   * under it (`round-header.ts`). Unset by the game itself, where there is no
   * plate and every header sits where it always has.
   */
  clearTop?: number;
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
  /**
   * How many ticks ahead of the simulation this device's picture of a *chart*
   * should run, and 0 for anything with no link.
   *
   * Delayed lockstep schedules every press `delayTicks` into the future
   * (`packages/net/src/lockstep.ts`), and every other control in the game
   * shrugs that off: a cannon a tenth of a second late is a cannon in the
   * right column. THE PULSE cannot, because the whole round is *when a thumb
   * landed* — its clean window is eight ticks and the delay is twelve, so on
   * two devices a player pressing exactly on the line was judged past PERFECT
   * every time. Drawing the arrow reaching the line this many ticks early is
   * what puts the press back on the note.
   *
   * **It is a fact about one pair of eyes, like `hand`.** `InputDelay` moves
   * it as the link is measured and the two devices never agree on it, which is
   * exactly why leading by it is safe: nothing here reaches the simulation, so
   * two screens running different leads are still one game.
   *
   * The sound does not lead and must not — the song is on the true clock, and
   * a picture ahead of it by the delay is what makes a press *to the picture*
   * land on the beat the music played (`packages/audio/src/mixer-pulse.ts`).
   */
  leadTicks?: number;
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
  /**
   * Play the current page of a wave guide's rehearsal again, for a host with a
   * REPLAY button to wire. Optional because it is the one thing on this
   * interface that is not about a frame: a renderer with no guide in it has
   * nothing to replay.
   */
  replayGuide?(): void;
}
