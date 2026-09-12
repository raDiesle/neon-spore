import { spine } from "./gland-fluid.js";
import type { Layout } from "./layout.js";
import type { SeatSkin } from "./seat-skin.js";

/**
 * WHAT A STRIP LOOKS LIKE, AS A RECORD.
 *
 * The channel, its lip, the rail, the stations and the block were `strip()` in
 * `band-channel.ts`, called by name — the one place the rail a column slides
 * along could be drawn, which meant a candidate panel could reshape the ship
 * and the chamber and still be handed the shipped trough. Lifted out on
 * 10 September 2026 with `panel-plan.ts` and `lobe-look.ts`, for the owner's
 * ask that a ship be different *from fresh* and not only in its skin.
 *
 * Nothing about *where* the strip is lives here: `Layout.cannonStrip` and
 * `shieldStrip` say, and `touch.ts` answers the same rectangle. The paint was
 * exactly what `strip()` was until 11 September 2026, when the owner took
 * GLAND out of `ship:body` and the trough — a channel cut in the tissue, a lit
 * lip, a rail of stations and a wet block on the column held — went with it.
 */

/** Everything the look is handed for one strip. */
export interface StripDraw {
  readonly ctx: CanvasRenderingContext2D;
  readonly l: Layout;
  /** 0 for the cannon's strip, 1 for the shield's — a slot index for caches. */
  readonly which: 0 | 1;
  /** The strip's row and height, from the layout. */
  readonly y: number;
  readonly h: number;
  /** The column the seat is holding. */
  readonly col: number;
  /** The control's own colour — the cannon's violet or the shield's cyan on
   * both seats, because it says *which control* (`docs/spec/controls.md`). */
  readonly hex: string;
  /** Whose panel this is: the cord lies in the seat's own flesh. */
  readonly skin: SeatSkin;
}

export interface StripLook {
  draw(d: StripDraw): void;
}

/** The shipped look: GLAND's spine — a lit cord through the flesh with a node
 * per column and a swollen wet node on the column held (`gland-fluid.ts`). It
 * replaced the trough cut in the tissue on 11 September 2026. */
export const STRIP_LOOK: StripLook = { draw: spine };
