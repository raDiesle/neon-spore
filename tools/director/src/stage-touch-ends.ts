import type { Field, Layout, ShipHand, ViewRole } from "@neon-spore/render";
import type { Command, World } from "@neon-spore/sim";
import type { StagePoint } from "./stage-point.js";

/**
 * **What the stage's pointer binding is handed, and what it hands back** —
 * cut out of `stage-touch.ts` on 27 September 2026, when pairing a pinch's
 * two fingers there took it to 241 of its 250 lines. The binding is the
 * behaviour; these are its two ends.
 */

export interface StageTouch {
  canvas: HTMLCanvasElement;
  /**
   * A pointer event, in the coordinates the renderer drew in. Handed down
   * rather than worked out here — see `stage-point.ts` for the four copies
   * this replaced and the miss they caused.
   */
  at: StagePoint["at"];
  /** Read fresh: the panel is resizable and the role switches under it. */
  layout: () => Layout;
  /** The field a grab is tested against, and whose hand it is — the seat the
   * role bar and the seat keys name, or the one `deskDown` asks for. */
  field: (seat?: 1 | 2) => Field;
  /** The seats this stage's one mouse may speak for (`render/desk-seat.ts`). */
  seats: () => readonly (1 | 2)[];
  push: (player: 1 | 2, command: Command) => void;
  /** The world a card is read off — whether one is up at all right now. */
  world: () => World;
  /** Play a guide's page of film again — the middle button on its bar. It is
   * the renderer's own clock and not the world's, so it is a call rather than a
   * command (`render/guide-play.ts`). */
  replay: () => void;
  /** Which seat's screen the role bar is holding, the same value `field()`
   * already answers `pointerSeat` with — a card up under `test` has to be
   * stepped in words, one under `p1`/`p2` is already just the one screen the
   * phone would show, so a press dismisses it the way the phone's own
   * `bindBriefing` does. */
  role: () => ViewRole;
  /** Takes every listener off again when aborted — a TRY view that closes
   * (`field-try.ts`). The stage itself lives as long as the page. */
  signal?: AbortSignal;
}

/**
 * What the binding hands back: the cup over whichever swelling this stage's
 * one mouse is on or holding, for the next paint to draw
 * (`packages/render/src/ship-hand.ts`). The same shape `bindControls` returns
 * to the game (`apps/game/src/input.ts`), and for the same reason — a pointer
 * is the host's and a picture is the renderer's.
 *
 * The stage answered every one of those gestures already and said nothing
 * about which swelling answered, so the one screen the control is judged on
 * was the one screen missing its feedback.
 *
 * A getter rather than the game's `ShipHandWatch`: that class holds a single
 * field and calls `shipHand` for every value it takes, and `keys.ts` says why
 * this package does not import `apps/game` to get it. The rule is still
 * called and not re-derived — every value here comes out of `shipHand`, which
 * answers null for the two strips and for a hold that is not the ship's, so
 * the stage cannot light a swelling the phone would leave dark.
 */
export interface StageHand {
  hand: () => ShipHand | undefined;
  /** Where the mouse is resting on the stage, for whatever lights up under it
   * (`render/hover.ts`). The desk is the only place this exists. */
  pointer: () => { x: number; y: number } | undefined;
}
