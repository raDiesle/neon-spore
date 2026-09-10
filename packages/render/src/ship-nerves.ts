import type { Lobe } from "./band-lobes.js";
import type { Layout } from "./layout.js";
import type { SeatSkin } from "./seat-skin.js";

/**
 * WHAT RUNS FROM A CONTROL TO THE ORGAN IT DRIVES, AS A RECORD.
 *
 * A slider moves the cannon and a button arms the shield, and nothing on the
 * screen has ever said so except the label. The owner, watching the first
 * whole-ship candidate on 10 September 2026: *buttons control the cannon and
 * shield, maybe we could create some visual connections.* This is the seam
 * for that — the eleventh of `magnet-look.ts`'s kind, and the first that
 * crosses the membrane: a nerve leaves a control in the chamber, passes
 * through the roof, and ends at a lobe on the hull.
 *
 * **It is drawn from `band.ts`, under the controls and outside the chamber's
 * clip**, after the tissue and whatever the join grew and before any strip or
 * button — so a nerve lies over the panel's flesh and under the thing it
 * leaves, and can reach up over the ship. The hull's membrane is handed in as
 * `surfaceY`, so the far end lands on the skin the eye is looking at.
 *
 * **The shipped record draws nothing.** Not because nothing should be there,
 * but because what should be there is a question for the pair, per ship: a
 * mouth is wired one way and a cell another, and every candidate in
 * `ship:body` answers it in its own material.
 */

/** A point on the screen. */
interface At {
  readonly x: number;
  readonly y: number;
}

export interface NerveDraw {
  readonly ctx: CanvasRenderingContext2D;
  readonly l: Layout;
  /** The wall clock in seconds. Everything here is a pure function of it. */
  readonly time: number;
  /** Whose ship this is, so a nerve is the seat's colour (`seat-skin.ts`). */
  readonly skin: SeatSkin;
  /** Every round control on this screen, with what each one is. */
  readonly lobes: readonly Lobe[];
  /** Where the cannon strip's knob stands, on a screen that draws that strip. */
  readonly cannon: At | null;
  /** The same for the shield strip. */
  readonly shield: At | null;
  /** The columns the two organs stand in, as screen x — the same columns the
   * knobs are drawn at, so a nerve's two ends agree without easing. */
  readonly cannonX: number;
  readonly shieldX: number;
  /** The membrane above a screen x, on a host that drew one; a caller with no
   * ship (a test chrome, a sheet) hands `null` and a nerve stops at the roof. */
  readonly surfaceY: ((x: number) => number) | null;
  /** The shield's window and the maw's, so a nerve can carry what is being
   * asked of the organ at its end. */
  readonly armed: boolean;
  readonly open: boolean;
}

export interface ShipNerves {
  draw(d: NerveDraw): void;
}

/** The shipped answer: nothing between a control and its organ but the label. */
export function unwired(_d: NerveDraw): void {}

export const SHIP_NERVES: ShipNerves = { draw: unwired };
