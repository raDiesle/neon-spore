import type { World } from "@neon-spore/sim";
import { drawChokeCoils } from "./choke-hull.js";
import { drawStuckClingers } from "./cling.js";
import type { FenceStrike } from "./fence-strike.js";
import { drawStuckGums } from "./gum.js";
import type { HullFrame, LobePositions, SurfaceY } from "./hull-frame.js";
import { type Layout, tileCX } from "./layout.js";
import type { ViewState } from "./renderer.js";

/**
 * **The fifth pass: what is stuck to the finished ship.** Drawn after
 * `drawShip` and before `drawOverlays`, on the same membrane the ship pass
 * just drew and over the rim it just lit — which is why none of these can go
 * down with the field, and why none of them is the ship's own business.
 *
 * Every call here is one `Canvas2DRenderer.draw` used to make directly, and
 * each was one landing: THE FENCE's strike, THE GUM, THE CHOKE, THE LIMPET
 * and THE LEECH, four calls in a row that had taken that file to its limit.
 * The order is the picture — a gum's drips hang over the fence's burn, a
 * coil sits over both — so a body that sticks to the ship next is added at
 * the end, not slipped in between.
 *
 * The split moves lines, not behaviour: the stub canvas's ordered call log
 * over every wave that reaches one of these was byte-identical before and
 * after, and `packages/render/test/frame.test.ts` draws them all again.
 */
export function drawOnShip(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  view: ViewState,
  strike: FenceStrike,
  hull: HullFrame,
  at: LobePositions,
  surfaceY: SurfaceY,
): void {
  // The shield's line burnt out where a wall earthed through the dome, and
  // the hull still conducting from it. Both sit *on* the rim `drawHull` has
  // just lit, so neither can go down with the field pass (`fence-strike.ts`).
  strike.draw(ctx, l, at, surfaceY, view.time);
  // And every gum stuck to the ship, on the same membrane and over the same
  // finished hull: its drips hang down the plating, which the ship pass
  // would otherwise cover (`gum.ts`).
  drawStuckGums(ctx, l, world, surfaceY, view.time);
  // And THE CHOKE's grip on the cannon, on the eased cannon the ship pass
  // drew, while the steer fault has it (`choke-hull.ts`).
  drawChokeCoils(ctx, l, world, hull.cannonX, surfaceY, view.time);
  // And THE LIMPET on the plate and THE LEECH on the cannon (`cling.ts`).
  const shieldX = tileCX(l, at.shield[0]?.col ?? world.shieldCol);
  drawStuckClingers(ctx, l, world, hull.cannonX, shieldX, surfaceY, view.beatPhase, view.time);
}
