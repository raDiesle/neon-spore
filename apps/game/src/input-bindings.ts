import type { ControlSet } from "@neon-spore/content";
import type { Layout } from "@neon-spore/render";
import type { Creature, MazeState, SimConfig, WardenState } from "@neon-spore/sim";
import type { InputBuffer } from "./input-buffer.js";

/**
 * **What the pointer rig is handed.** Split out of `input.ts` when the ship
 * itself became touchable and that file reached its length limit, along the
 * seam `render/touch-field.ts` was cut on: this is a *shape*, and next door is
 * the listener that reads one. Every field on it arrived one at a time with a
 * paragraph saying why it is read fresh rather than captured, or required
 * rather than defaulted — which is the half a reader scrolls past.
 *
 * Re-exported from `input.ts`, so nothing that already reached for `Bindings`
 * through that file had to move.
 */
export interface Bindings {
  canvas: HTMLCanvasElement;
  buffer: InputBuffer;
  /** Read fresh on every event — the layout changes when the screen does. */
  layout: () => Layout;
  /**
   * A pointer event in the coordinates the picture was drawn in, or null when
   * it landed beside the phone-shaped rectangle the game is drawn into.
   *
   * Handed in rather than worked out here for the reason
   * `render/stage-point.ts` gives: a second copy of where a finger lands
   * drifts. This file had one of five in `apps/game` alone (`viewport.ts`).
   */
  inStage: (e: { clientX: number; clientY: number }) => { x: number; y: number } | null;
  isOver: () => boolean;
  /**
   * Which seat this device holds. The field belongs to both players, so a
   * finger on a creature has to be signed with whoever is sitting here — the
   * strips below can be told apart by where they are, and this cannot.
   */
  player: () => 1 | 2;
  /** The numbers the hit test needs: a tether's row, a drum's width. */
  cfg: SimConfig;
  /**
   * THE MAZE, if it is the boss running. Read fresh and stated rather than
   * defaulted, for the reason `Field` gives: without it the handle on the
   * wheel's string is drawn and answers nothing.
   */
  maze: () => MazeState | null;
  /**
   * THE WARDEN, if it is the boss running. Read fresh and stated rather than
   * defaulted, for the same reason `maze` is: without it the handle on its rope
   * is drawn and answers nothing.
   */
  warden: () => WardenState | null;
  /**
   * The panel this wave is played on, read fresh: a control the wave's set does
   * not name has no button and must not answer a thumb (`render/touch.ts`).
   */
  controls: () => ControlSet;
  /** The field, for hit-testing a finger against what is falling. */
  creatures: () => readonly Creature[];
  /**
   * Where the two lobes are standing. The ship is touchable where it is drawn
   * — slide the cannon, press the shield, swipe the muzzle — so the hit test
   * has to be told which columns those swellings are over
   * (`render/touch-ship.ts`).
   */
  cannonCol: () => number;
  shieldCol: () => number;
  /**
   * Whether the wave's opening is up. Only the ring reads it, and only to stay
   * dark: while a wave is held the simulation drops everything but the
   * acknowledgement (`sim/step.ts`), so a swelling that lit under a thumb
   * would be feedback for a press that never happened — the exact lie this
   * whole ring exists to avoid.
   */
  opening: () => boolean;
  /** 0..1 within the beat, so a grab lands on the creature as drawn, not as
   * it stood on the last beat. */
  beatPhase: () => number;
  /**
   * Whether the guide is up — passed straight through to the keyboard rig,
   * which needs it to keep Space from skipping the introduction ahead of the
   * guide (`keys.ts`).
   */
  guideHolds: () => boolean;
  /**
   * Whether SNAKE is the boss running — passed straight through to the
   * keyboard rig, where the arrows are the body's four while it stands and the
   * wave step otherwise (`keys-round.ts`).
   */
  snakeHolds: () => boolean;
  onPauseToggle: () => void;
  /** Wave step, for the test keys. Positive is forwards. */
  onWaveStep: (delta: number) => void;
  /** R, behind a guide: play its page of film again (`render/guide-nav.ts`). */
  onGuideReplay: () => void;
}
