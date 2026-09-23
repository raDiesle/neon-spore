import type { World } from "@neon-spore/sim";
import { drawBossCue } from "./boss-cue-draw.js";
import type { SurfaceY } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { drawPairCall } from "./pair-call.js";
import type { ViewState } from "./renderer.js";
import { wellShown } from "./well.js";

/**
 * **The one word the boss wants, drawn separately from `drawBodies` and after
 * `drawShip`** (`canvas2d.ts`), rather than at its old station between
 * `drawBoss` and `drawPods` in `frame-field.ts`'s own `drawBodies` — moved out
 * to a file of its own rather than grown onto that one, which was already at
 * its 250-line limit.
 *
 * Two passes paint over whatever `drawBodies` left behind, and a cue standing
 * where either one reaches lost its word to it: `drawShip`, over anything at
 * `l.hullY` — `MOVE` on the cannon, on every boss that parks it there,
 * confirmed on a real frame of THE ORRERY and THE THROAT
 * (`docs/queue.md`, "A cue standing on the hull line has its verb drawn under
 * the ship") — and, found the same session, `candle-dark.ts`'s own black,
 * which comes down over the *whole* height of an unlit column and is why THE
 * CANDLE's `FIRE` never showed even standing on the glow, its one lit tile.
 * Both fixes are the same fix: draw the cue after both of them rather than
 * teach either one to leave a hole for it.
 *
 * `wellShown` guards it for `drawWellBodies`' own reason: THE WELL's rolled
 * field draws no boss cue at all, and asking here is the same question
 * `drawBodies` asked before this moved out from under it — not a second copy
 * of the rule, since this is the only other place that rule is needed.
 *
 * **The second seat's clock is drawn here too**, after the cue and for the
 * same reason: it is the other thing the field says to the pair, and nothing
 * drawn later may cover it (`pair-call.ts`).
 */
export function drawFieldBossCue(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  view: ViewState,
  skinY?: SurfaceY,
): void {
  if (wellShown(l, world)) return;
  drawBossCue(ctx, l, world, view.beatPhase, view.time, skinY);
  drawPairCall(ctx, l, world, view.beatPhase);
}
