import { choice } from "../field-try-bar.js";
import type { GooBody } from "./body.js";
import { type Press, UNPRESSED } from "./press.js";
import { paintSoft, type SoftDrop, type Turn } from "./soft.js";
import { CRATER, CRATER_RIPPLES, CRATER_STILL, RIPPLES_STILL } from "./soft-crater.js";
import { PLASTIC, PLASTIC_STILL } from "./soft-plastic.js";
import type { GooStyle } from "./style.js";

/**
 * **How every GOO drop is drawn**: as one of the soft drops a thumb sinks
 * into (`soft.ts`) — the owner, 11 October 2026: *more alternatives of how
 * pull button looks … not changing colour, but the 3d effect … like a slime
 * or a sponge or … soft plastic*. SOFT PLASTIC was picked the same day, the
 * rest went (*remove other variants of "drop", but keep "soft plastic"*), and
 * what is offered beside it are its own variants: one that stops turning
 * while it is pulled, and craters (`soft-crater.ts`). Of those the owner liked
 * CRATER · RIPPLES most and asked for it with STILL's slowing (RIPPLES · STILL),
 * so that is first and the one the lab opens on. The PULL LAB's bar
 * picks it (DROP) for every GOO look at once, so an ending is judged with any
 * drop rather than multiplying the picker. A director setting, not the
 * game's: nothing here is stored.
 */
export type DropLook = SoftDrop;

export const SOFT_DROPS: readonly SoftDrop[] = [
  RIPPLES_STILL,
  PLASTIC,
  PLASTIC_STILL,
  CRATER,
  CRATER_STILL,
  CRATER_RIPPLES,
];

export const GOO_DROP: { look: DropLook } = { look: RIPPLES_STILL };

/** The drop, as the bar has it, `turn` the moment it turns by and `press` how deep a
 * thumb is in it; gives back the body drawn, pressed and turned as it is, for an arrow
 * to be laid on. */
export function paintGoo(
  ctx: CanvasRenderingContext2D,
  b: GooBody,
  style: GooStyle,
  time: number,
  tint: { red: number; green?: number; alpha?: number },
  turn: Turn,
  press: Press = UNPRESSED,
): GooBody {
  return paintSoft(ctx, GOO_DROP.look, b, style, time, tint, press, turn);
}

/** The bar's choice for every GOO drop; `changed` redraws whatever is not redrawn every
 * frame. */
export function dropChoices(changed: () => void): HTMLElement[] {
  const look = choice<DropLook>(
    SOFT_DROPS.map((d): [string, DropLook] => [d.name, d]),
    GOO_DROP.look,
    (l) => {
      GOO_DROP.look = l;
      changed();
    },
    "DROP",
  );
  return [look];
}
