import { drawDrips } from "./band-slime.js";
import type { Circle, Layout } from "./layout.js";
import type { SeatSkin } from "./seat-skin.js";

/**
 * WHAT HANGS OFF THE MEMBRANE INTO THE CHAMBER, AS A RECORD.
 *
 * `drawBand` called `drawDrips` by name, inside the chamber's clip, between
 * the join's attachment and the nerves — which meant the slime the owner
 * asked for (*some slime from ship flowing down a little bit into the control
 * set*) had nowhere for a second answer to sit. `panel:band-skin` is a slot
 * about the furniture round a player's thumb — the button's bed, its gloss,
 * what moves on it and what hangs over it — and the last of those was the one
 * thing on the panel still called rather than read. Lifted out on 11 September
 * 2026, the twelfth of `magnet-look.ts`'s kind; the shipped pendants are
 * unchanged and stay in `band-slime.ts`.
 *
 * It is drawn **inside the chamber's clip**: a pendant starts above the
 * membrane and relies on that contour to cut it to the skin, so nothing here
 * can put a shoulder of slime across the ship's belly however a candidate
 * answers.
 */
export interface SlimeDraw {
  readonly ctx: CanvasRenderingContext2D;
  readonly l: Layout;
  /** The wall clock in seconds. Everything here is a pure function of it. */
  readonly time: number;
  /** Whose panel this is: slime is the seat's own fluid (`seat-skin.ts`). */
  readonly skin: SeatSkin;
  /** Every control on this screen, so a pendant can hang off whatever roof the
   * join shaped over them rather than off a second copy of the shipped one. */
  readonly lobes: readonly Circle[];
}

export interface BandSlime {
  drips(d: SlimeDraw): void;
}

/** The shipped slime: seven pendants off the membrane, one path and one
 * stroke, with a bead released now and then. */
export function pendants(d: SlimeDraw): void {
  drawDrips(d.ctx, d.l, d.time, d.skin, d.lobes);
}

export const BAND_SLIME: BandSlime = { drips: pendants };
