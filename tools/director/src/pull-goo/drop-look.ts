import type { Point } from "@neon-spore/content";
import { choice } from "../field-try-bar.js";
import { paintBall } from "./ball.js";
import { type GooBody, paintBody } from "./body.js";
import { type Press, UNPRESSED } from "./press.js";
import { paintSoft, type SoftDrop } from "./soft.js";
import { DOUGH } from "./soft-dough.js";
import { PLASTIC } from "./soft-plastic.js";
import { SLIME } from "./soft-slime.js";
import { SPONGE } from "./soft-sponge.js";
import type { GooStyle } from "./style.js";

/**
 * **How every GOO drop is drawn**: as the flat slime SINK was picked in, as a
 * lit ball whose surface rolls (`ball.ts`), or as one of the soft drops a
 * thumb sinks into (`soft.ts`) — the owner, 11 October 2026: *more
 * alternatives of how pull button looks … not changing colour, but the 3d
 * effect … like a slime or a sponge or … soft plastic*. The PULL LAB's bar
 * picks it (DROP) for every GOO look at once, so an ending is judged with any
 * drop rather than multiplying the picker. A director setting, not the
 * game's: nothing here is stored.
 */
export type DropLook = "flat" | "ball" | SoftDrop;

export const SOFT_DROPS: readonly SoftDrop[] = [SLIME, SPONGE, PLASTIC, DOUGH];

export const GOO_DROP: { look: DropLook } = { look: "ball" };

/** The drop, as the bar has it; `way` is the way a ball rolls, down when not given, and
 * `press` how deep a thumb is in it, which only a soft drop shows. */
export function paintGoo(
  ctx: CanvasRenderingContext2D,
  b: GooBody,
  style: GooStyle,
  time: number,
  tint: { red: number; green?: number; alpha?: number },
  way: Point = { x: 0, y: 1 },
  press: Press = UNPRESSED,
): void {
  const look = GOO_DROP.look;
  if (look === "ball") paintBall(ctx, b, style, time, tint, way);
  else if (look === "flat") paintBody(ctx, b, style, time, tint);
  else paintSoft(ctx, look, b, style, time, tint, press);
}

/** The bar's choice for every GOO drop; `changed` redraws whatever is not redrawn every
 * frame. */
export function dropChoices(changed: () => void): HTMLElement[] {
  const look = choice<DropLook>(
    [
      ["FLAT", "flat"],
      ["3D BALL", "ball"],
      ...SOFT_DROPS.map((d): [string, DropLook] => [d.name, d]),
    ],
    GOO_DROP.look,
    (l) => {
      GOO_DROP.look = l;
      changed();
    },
    "DROP",
  );
  return [look];
}
